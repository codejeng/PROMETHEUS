import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { sourceSearchers } from "@/lib/research/sources";
import { scoreRelevance, dedupeByTitle } from "@/lib/research/relevance";
import { ExternalPaperResult, GapAnalysisReport, ResearchSource } from "@/types";

export const runtime = "nodejs";

const SOURCES: ResearchSource[] = ["arxiv", "semanticScholar", "openAlex", "crossref"];
const MOST_CITED_COUNT = 10;
const CONTEXT_PAPER_COUNT = 12; // how many papers we hand to the LLM as grounding
const MAX_TOKENS = 4000; // 20-paper context + readingOrder reasoning can exceed 2000 and get silently truncated

interface GapAnalysisRequestBody {
  topic: string;
  apiKey: string;
  baseURL: string;
  model: string;
}

const SYSTEM_PROMPT = `You are a research analyst helping a prospective grad student or researcher get oriented \
in a topic fast. You will be given a topic and a list of real papers retrieved from arXiv, Semantic Scholar, \
OpenAlex, and Crossref (with citation counts where known). Ground every claim in the provided papers — do not \
invent papers, authors, or institutions that are not implied by the list. If the list is thin, say so honestly \
in currentState rather than filling gaps with speculation.

Keep every string concise — 1-2 sentences max per item, no exceptions. This output must fit a strict token budget.

Respond with ONLY a JSON object of this exact shape, no markdown, no code fences, no text outside the JSON:
{
  "currentState": string,        // 2-3 sentences on where this field stands right now, grounded in the papers given
  "openProblems": string[],      // 3-5 specific unsolved problems or limitations visible in the papers' own stated gaps/future work, one sentence each
  "topLabs": string[],           // institutions/labs that appear to be active here, inferred from author affiliations and paper clusters in the list; each entry like "MIT — plasma control via RL"
  "readingOrder": [{"paperId": string, "reason": string}],  // pick the 5-8 MOST IMPORTANT papers from the list (not all of them), using the exact "id" field, foundational/survey-like papers first; reason is one short sentence
  "thesisIdeas": string[]        // 3-5 concrete, specific potential research directions or thesis topics that address the open problems above, one sentence each
}`;

export async function POST(req: NextRequest) {
  const body: GapAnalysisRequestBody = await req.json();
  const { topic, apiKey, baseURL, model } = body;

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }
  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!baseURL || !model) {
    return NextResponse.json({ error: "Missing provider base URL or model" }, { status: 400 });
  }

  const query = topic.trim();

  const settled = await Promise.allSettled(SOURCES.map((source) => sourceSearchers[source](query, 15)));
  let combined: ExternalPaperResult[] = [];
  settled.forEach((result) => {
    if (result.status === "fulfilled") combined = combined.concat(result.value);
  });

  if (combined.length === 0) {
    return NextResponse.json(
      { error: "No papers found for this topic across arXiv, Semantic Scholar, OpenAlex, or Crossref." },
      { status: 404 }
    );
  }

  const scored = combined.map((p) => ({ ...p, relevance: scoreRelevance(query, p) }));
  const deduped = dedupeByTitle(scored).sort((a, b) => b.relevance - a.relevance);

  const mostCitedPapers = [...deduped]
    .filter((p) => typeof p.citationCount === "number")
    .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
    .slice(0, MOST_CITED_COUNT);

  // Grounding set for the LLM: the most-cited papers plus enough of the
  // top-relevance results to cover ones citation data didn't catch.
  const contextPapers = dedupeByTitle([...mostCitedPapers, ...deduped]).slice(0, CONTEXT_PAPER_COUNT);

  const paperList = contextPapers
    .map((p, i) => {
      const bits = [
        `${i + 1}. id="${p.id}"`,
        `title="${p.title}"`,
        p.authors.length ? `authors=[${p.authors.slice(0, 5).join(", ")}]` : null,
        p.year ? `year=${p.year}` : null,
        typeof p.citationCount === "number" ? `citations=${p.citationCount}` : null,
        p.abstract ? `abstract="${p.abstract.slice(0, 400)}"` : null,
      ].filter(Boolean);
      return bits.join(" | ");
    })
    .join("\n");

  const userPrompt = `Topic: ${query}\n\nPapers:\n${paperList}`;

  const client = new OpenAI({ apiKey, baseURL });

  try {
    let content: string | null | undefined;
    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: MAX_TOKENS,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      content = response.choices[0]?.message?.content;
    } catch {
      const response = await client.chat.completions.create({
        model,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      content = response.choices[0]?.message?.content;
    }

    if (!content) {
      return NextResponse.json({ error: "No analysis was returned." }, { status: 502 });
    }

    const parsed = extractJSON(content);
    if (!parsed) {
      return NextResponse.json({ error: "The model's response wasn't valid JSON." }, { status: 502 });
    }

    const paperById = new Map(contextPapers.map((p) => [p.id, p]));
    const rawReadingOrder: Array<{ paperId?: unknown; reason?: unknown }> = Array.isArray(parsed.readingOrder)
      ? parsed.readingOrder
      : [];
    const readingOrder = rawReadingOrder
      .filter(
        (r): r is { paperId: string; reason: string } =>
          !!r && typeof r.paperId === "string" && paperById.has(r.paperId) && typeof r.reason === "string"
      )
      .map((r) => ({ paper: paperById.get(r.paperId)!, reason: r.reason }));

    const report: GapAnalysisReport = {
      topic: query,
      currentState: typeof parsed.currentState === "string" ? parsed.currentState : "",
      openProblems: Array.isArray(parsed.openProblems) ? parsed.openProblems.filter((s: unknown) => typeof s === "string") : [],
      topLabs: Array.isArray(parsed.topLabs) ? parsed.topLabs.filter((s: unknown) => typeof s === "string") : [],
      mostCitedPapers: mostCitedPapers.length > 0 ? mostCitedPapers : contextPapers.slice(0, MOST_CITED_COUNT),
      readingOrder,
      thesisIdeas: Array.isArray(parsed.thesisIdeas) ? parsed.thesisIdeas.filter((s: unknown) => typeof s === "string") : [],
    };

    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json({ error: describeError(err) }, { status: 502 });
  }
}

function extractJSON(text: string): Record<string, unknown> | null {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function describeError(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    return err.message || `Request failed (${err.status ?? "unknown status"})`;
  }
  if (err instanceof Error) return err.message;
  return "Could not reach the AI provider.";
}
