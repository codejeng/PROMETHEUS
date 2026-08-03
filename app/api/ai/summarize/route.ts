import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

interface SummarizeRequestBody {
  apiKey: string;
  baseURL: string;
  model: string;
  title: string;
  authors?: string[];
  abstract?: string;
}

const SYSTEM_PROMPT =
  "You summarize research papers for a personal reading log. Respond with ONLY a JSON object " +
  'of the exact shape {"summary": string, "keyInsight": string} — no markdown, no code fences, ' +
  "no text before or after the JSON. summary is 2-3 plain-language sentences. keyInsight is the " +
  "single most important takeaway, in one sentence.";

export async function POST(req: NextRequest) {
  const body: SummarizeRequestBody = await req.json();
  const { apiKey, baseURL, model, title, authors, abstract } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!baseURL || !model) {
    return NextResponse.json({ error: "Missing provider base URL or model" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Missing paper title" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey, baseURL });

  const userPrompt = [
    `Title: ${title}`,
    authors?.length ? `Authors: ${authors.join(", ")}` : null,
    abstract
      ? `Abstract: ${abstract}`
      : "No abstract was available — summarize based on the title alone, and make clear the summary is speculative.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    let content: string | null | undefined;

    // Most gateways accept response_format: json_object; some reject the
    // param outright. Retry once without it before giving up.
    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: 600,
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
        max_tokens: 600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      content = response.choices[0]?.message?.content;
    }

    if (!content) {
      return NextResponse.json({ error: "No summary was returned." }, { status: 502 });
    }

    const parsed = extractJSON(content);
    if (!parsed || typeof parsed.summary !== "string" || typeof parsed.keyInsight !== "string") {
      return NextResponse.json({ error: "The model's response wasn't valid JSON." }, { status: 502 });
    }

    return NextResponse.json({ summary: parsed.summary, keyInsight: parsed.keyInsight });
  } catch (err) {
    return NextResponse.json({ error: describeError(err) }, { status: 502 });
  }
}

function extractJSON(text: string): { summary?: unknown; keyInsight?: unknown } | null {
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
