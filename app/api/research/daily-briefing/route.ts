import { NextRequest } from "next/server";
import OpenAI from "openai";
import { sourceSearchers, searchArxiv } from "@/lib/research/sources";
import { fetchAllNews, searchGithubRepos } from "@/lib/research/dailySources";
import { scoreRelevance, dedupeByTitle } from "@/lib/research/relevance";
import {
  BriefingStreamEvent,
  DailyBriefingReport,
  ExternalPaperResult,
  GithubProject,
  NewsItem,
  ScoredNewsItem,
  ScoredPaper,
  ScoredProject,
} from "@/types";

export const runtime = "nodejs";

// Fallbacks if the client sends no interest topics (e.g. an older cached
// build). The user-facing, editable copy of these lives in the
// briefing_interests Supabase table — see store/useBriefingInterestsStore.ts.
const DEFAULT_PRIMARY_TOPICS = [
  "Nuclear Fusion", "Plasma Physics", "AI for Science", "Artificial Intelligence",
  "Quantum Computing", "Robotics", "Brain Computer Interface", "Space Technology",
  "Advanced Manufacturing", "Future Energy",
];
const DEFAULT_SECONDARY_TOPICS = [
  "MIT", "Stanford", "ETH Zurich", "EPFL", "Caltech", "Cambridge", "Oxford",
  "Princeton Plasma Physics Laboratory", "ITER", "EUROfusion",
  "OpenAI", "Anthropic", "DeepMind", "NVIDIA", "SpaceX", "Neuralink",
];
const MAX_GITHUB_KEYWORDS = 8;

const LOOKBACK_DAYS = 3; // "last 24h" is too thin across niche topics in practice; see CONTEXT.md
const MAX_TOKENS = 6000;

const NOISE_PATTERNS = /sponsored|advertisement|partner content|press release/i;

interface DailyBriefingRequestBody {
  apiKey: string;
  baseURL: string;
  model: string;
  primaryTopics?: string[];
  secondaryTopics?: string[];
}

interface CandidatePaper {
  id: string;
  paper: ExternalPaperResult;
}
interface CandidateNews {
  id: string;
  item: NewsItem;
}
interface CandidateProject {
  id: string;
  project: GithubProject;
}

function buildSystemPrompt(primaryTopics: string[], secondaryTopics: string[]): string {
  return `You are a research analyst producing a daily intelligence briefing for a researcher \
focused on: ${primaryTopics.join(", ")} (institutions/orgs of interest: ${secondaryTopics.join(", ")}).

You will be given candidate papers, news items, and GitHub projects retrieved in the last ${LOOKBACK_DAYS} days. \
Think like a research analyst, not a search engine: prioritize high-impact, high-novelty items and ignore \
low-quality or marginal ones. Only select items actually present in the candidate lists — never invent papers, \
articles, or repos.

Candidate ids like "paper:3" or "news:7" are internal references — use them ONLY in the "id" field of topPapers/ \
topNews/topProjects. NEVER write a candidate id inside any prose string (highlights, trends, researchIdeas, \
researchGapOfTheDay, questionWorthThinking, etc.) — refer to work by its actual title or a short paraphrase there \
instead, exactly as a human analyst's writeup would.

If the candidates are thin or nothing significant stands out, set "isQuiet": true and write a short honest \
quietMessage (e.g. "Today is relatively quiet. Nothing significant happened in your research domains.") — do not \
force weak items into the report just to fill it out.

Hard limits: at most 10 papers, 10 news items, 5 GitHub projects, 3 funding-related items. Keep every string to \
1-2 sentences. Respond with ONLY a JSON object of this exact shape, no markdown, no code fences, no text outside it:
{
  "isQuiet": boolean,
  "quietMessage": string | null,
  "highlights": string[],              // 2-4 sentence bullets, the single most important things today
  "topPapers": [{"id": string, "whyItMatters": string, "connectionToInterests": string}],
  "topNews": [{"id": string, "whyItMatters": string, "connectionToInterests": string}],
  "topProjects": [{"id": string, "whyItMatters": string}],
  "conferences": string[],             // upcoming conferences relevant to these fields you know of (general knowledge, not from the candidate list) — empty array if none come to mind, don't force it
  "funding": string[],                 // funding/investment news drawn ONLY from the candidate news items, one sentence each — empty array if none
  "trends": string[],                  // emerging patterns visible across today's candidates
  "researchIdeas": string[],           // potential startup ideas / interesting experiments suggested by today's items
  "researchGapOfTheDay": string,       // one specific open problem implied by today's items
  "questionWorthThinking": string,     // one open-ended question for the reader to sit with
  "quoteOfTheDay": string              // a short relevant quote (attribute it if you use a real one; otherwise write one original aphorism-style line and don't attribute it to anyone)
}`;
}

export async function POST(req: NextRequest) {
  const body: DailyBriefingRequestBody = await req.json();
  const { apiKey, baseURL, model } = body;
  const primaryTopics = body.primaryTopics?.length ? body.primaryTopics : DEFAULT_PRIMARY_TOPICS;
  const secondaryTopics = body.secondaryTopics?.length ? body.secondaryTopics : DEFAULT_SECONDARY_TOPICS;

  if (!apiKey || typeof apiKey !== "string") {
    return jsonError("Missing API key", 400);
  }
  if (!baseURL || !model) {
    return jsonError("Missing provider base URL or model", 400);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: BriefingStreamEvent) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 3600 * 1000);
        const sinceISODate = since.toISOString().slice(0, 10);

        send({ stage: "papers", status: "active" });
        send({ stage: "news", status: "active" });
        send({ stage: "projects", status: "active" });

        const [papers, newsResult, projects] = await Promise.all([
          fetchRecentPapers(since, primaryTopics)
            .then((r) => {
              send({ stage: "papers", status: "done", count: r.length });
              return r;
            })
            .catch(() => {
              send({ stage: "papers", status: "error" });
              return [] as ExternalPaperResult[];
            }),
          fetchAllNews()
            .then((r) => {
              if (Object.keys(r.errors).length) {
                console.warn("[daily-briefing] news feed errors:", r.errors);
              }
              send({ stage: "news", status: "done", count: r.items.length });
              return r;
            })
            .catch((err) => {
              console.error("[daily-briefing] fetchAllNews failed:", err);
              send({ stage: "news", status: "error" });
              return { items: [] as NewsItem[], errors: {} };
            }),
          fetchRecentProjects(sinceISODate, primaryTopics)
            .then((r) => {
              send({ stage: "projects", status: "done", count: r.length });
              return r;
            })
            .catch((err) => {
              console.error("[daily-briefing] fetchRecentProjects failed:", err);
              send({ stage: "projects", status: "error" });
              return [] as GithubProject[];
            }),
        ]);

        const recentNews = newsResult.items.filter(
          (n) => !NOISE_PATTERNS.test(n.title) && (!n.publishedDate || new Date(n.publishedDate) >= since)
        );
        // Score against each interest topic individually and take the best match, rather than
        // one combined query — a headline that strongly matches one topic (e.g. "Nuclear Fusion")
        // would otherwise be diluted into irrelevance by the other ~30 unrelated topic terms.
        const interestTopics = [...primaryTopics, ...secondaryTopics];
        const relevantNews = recentNews
          .map((n) => ({
            n,
            score: Math.max(
              ...interestTopics.map((topic) => scoreRelevance(topic, { title: n.title, abstract: n.snippet }))
            ),
          }))
          .filter((x) => x.score > 0.05)
          .sort((a, b) => b.score - a.score)
          .slice(0, 30)
          .map((x) => x.n);

        const candidatePapers: CandidatePaper[] = papers.slice(0, 25).map((p, i) => ({ id: `paper:${i}`, paper: p }));
        const candidateNews: CandidateNews[] = relevantNews.map((n, i) => ({ id: `news:${i}`, item: n }));
        const candidateProjects: CandidateProject[] = projects.slice(0, 15).map((p, i) => ({ id: `gh:${i}`, project: p }));

        const totalCandidates = candidatePapers.length + candidateNews.length + candidateProjects.length;

        if (totalCandidates < 3) {
          send({
            stage: "complete",
            report: emptyReport("Today is relatively quiet. Nothing significant happened in your research domains."),
          });
          controller.close();
          return;
        }

        const candidateBlock = [
          "Papers:",
          ...candidatePapers.map(formatPaperCandidate),
          "",
          "News:",
          ...candidateNews.map(formatNewsCandidate),
          "",
          "GitHub projects:",
          ...candidateProjects.map(formatProjectCandidate),
        ].join("\n");

        send({ stage: "ai", status: "active" });
        const client = new OpenAI({ apiKey, baseURL });
        const systemPrompt = buildSystemPrompt(primaryTopics, secondaryTopics);

        let content: string | null | undefined;
        try {
          const response = await client.chat.completions.create({
            model,
            max_tokens: MAX_TOKENS,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: candidateBlock },
            ],
          });
          content = response.choices[0]?.message?.content;
        } catch {
          const response = await client.chat.completions.create({
            model,
            max_tokens: MAX_TOKENS,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: candidateBlock },
            ],
          });
          content = response.choices[0]?.message?.content;
        }

        if (!content) {
          send({ stage: "ai", status: "error" });
          send({ stage: "fatal", error: "No briefing was returned." });
          controller.close();
          return;
        }

        const parsed = extractJSON(content);
        if (!parsed) {
          send({ stage: "ai", status: "error" });
          send({ stage: "fatal", error: "The model's response wasn't valid JSON." });
          controller.close();
          return;
        }

        send({ stage: "ai", status: "done" });

        if (parsed.isQuiet) {
          send({
            stage: "complete",
            report: emptyReport(
              typeof parsed.quietMessage === "string" && parsed.quietMessage
                ? parsed.quietMessage
                : "Today is relatively quiet. Nothing significant happened in your research domains."
            ),
          });
          controller.close();
          return;
        }

        const paperById = new Map(candidatePapers.map((c) => [c.id, c.paper]));
        const newsById = new Map(candidateNews.map((c) => [c.id, c.item]));
        const projectById = new Map(candidateProjects.map((c) => [c.id, c.project]));

        const topPapers: ScoredPaper[] = asArray(parsed.topPapers)
          .filter((r): r is Record<string, unknown> & { id: string } => !!r && typeof r.id === "string" && paperById.has(r.id))
          .slice(0, 10)
          .map((r) => ({
            paper: paperById.get(r.id)!,
            whyItMatters: typeof r.whyItMatters === "string" ? r.whyItMatters : "",
            connectionToInterests: typeof r.connectionToInterests === "string" ? r.connectionToInterests : "",
          }));

        const topNews: ScoredNewsItem[] = asArray(parsed.topNews)
          .filter((r): r is Record<string, unknown> & { id: string } => !!r && typeof r.id === "string" && newsById.has(r.id))
          .slice(0, 10)
          .map((r) => ({
            item: newsById.get(r.id)!,
            whyItMatters: typeof r.whyItMatters === "string" ? r.whyItMatters : "",
            connectionToInterests: typeof r.connectionToInterests === "string" ? r.connectionToInterests : "",
          }));

        const topProjects: ScoredProject[] = asArray(parsed.topProjects)
          .filter((r): r is Record<string, unknown> & { id: string } => !!r && typeof r.id === "string" && projectById.has(r.id))
          .slice(0, 5)
          .map((r) => ({
            project: projectById.get(r.id)!,
            whyItMatters: typeof r.whyItMatters === "string" ? r.whyItMatters : "",
          }));

        const report: DailyBriefingReport = {
          date: new Date().toISOString().slice(0, 10),
          isQuiet: false,
          highlights: asStringArray(parsed.highlights),
          topPapers,
          topNews,
          topProjects,
          conferences: asStringArray(parsed.conferences),
          funding: asStringArray(parsed.funding),
          trends: asStringArray(parsed.trends),
          researchIdeas: asStringArray(parsed.researchIdeas),
          researchGapOfTheDay: typeof parsed.researchGapOfTheDay === "string" ? parsed.researchGapOfTheDay : "",
          questionWorthThinking: typeof parsed.questionWorthThinking === "string" ? parsed.questionWorthThinking : "",
          quoteOfTheDay: typeof parsed.quoteOfTheDay === "string" ? parsed.quoteOfTheDay : "",
        };

        send({ stage: "complete", report });
      } catch (err) {
        send({ stage: "fatal", error: describeError(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
}

async function fetchRecentPapers(since: Date, primaryTopics: string[]): Promise<ExternalPaperResult[]> {
  const query = primaryTopics.map((t) => `"${t}"`).join(" OR ");
  const settled = await Promise.allSettled([
    searchArxiv(query, 20, { sortByDate: true }),
    sourceSearchers.semanticScholar(query, 15),
    sourceSearchers.openAlex(query, 15),
    sourceSearchers.crossref(query, 15),
  ]);
  let combined: ExternalPaperResult[] = [];
  settled.forEach((result) => {
    if (result.status === "fulfilled") combined = combined.concat(result.value);
  });
  const recent = combined.filter((p) => p.publishedDate && new Date(p.publishedDate) >= since);
  return dedupeByTitle(recent).sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));
}

async function fetchRecentProjects(sinceISODate: string, primaryTopics: string[]): Promise<GithubProject[]> {
  const keywords = primaryTopics.slice(0, MAX_GITHUB_KEYWORDS);
  // Firing all keyword searches at once can trip GitHub's secondary rate
  // limit even with a token, so stagger them slightly instead of a single burst.
  const settled = await Promise.allSettled(
    keywords.map((kw, i) => delay(i * 150).then(() => searchGithubRepos(kw, sinceISODate, 5)))
  );
  const seen = new Set<string>();
  const out: GithubProject[] = [];
  settled.forEach((result, i) => {
    if (result.status !== "fulfilled") {
      console.warn(`[daily-briefing] GitHub search failed for keyword "${keywords[i]}":`, result.reason);
      return;
    }
    result.value.forEach((p) => {
      if (seen.has(p.name)) return;
      seen.add(p.name);
      out.push(p);
    });
  });
  return out.sort((a, b) => b.stars - a.stars);
}

function emptyReport(quietMessage: string): DailyBriefingReport {
  return {
    date: new Date().toISOString().slice(0, 10),
    isQuiet: true,
    quietMessage,
    highlights: [],
    topPapers: [],
    topNews: [],
    topProjects: [],
    conferences: [],
    funding: [],
    trends: [],
    researchIdeas: [],
    researchGapOfTheDay: "",
    questionWorthThinking: "",
    quoteOfTheDay: "",
  };
}

function formatPaperCandidate(c: CandidatePaper): string {
  const p = c.paper;
  const bits = [
    `${c.id}: title="${p.title}"`,
    p.authors.length ? `authors=[${p.authors.slice(0, 3).join(", ")}]` : null,
    `source=${p.source}`,
    p.publishedDate ? `date=${p.publishedDate.slice(0, 10)}` : null,
    typeof p.citationCount === "number" ? `citations=${p.citationCount}` : null,
    p.abstract ? `abstract="${p.abstract.slice(0, 200)}"` : null,
  ].filter(Boolean);
  return bits.join(" | ");
}

function formatNewsCandidate(c: CandidateNews): string {
  const n = c.item;
  const bits = [
    `${c.id}: title="${n.title}"`,
    `source=${n.source}`,
    n.publishedDate ? `date=${n.publishedDate.slice(0, 10)}` : null,
    n.snippet ? `snippet="${n.snippet.slice(0, 200)}"` : null,
  ].filter(Boolean);
  return bits.join(" | ");
}

function formatProjectCandidate(c: CandidateProject): string {
  const p = c.project;
  const bits = [
    `${c.id}: name="${p.name}"`,
    `stars=${p.stars}`,
    p.language ? `language=${p.language}` : null,
    p.description ? `description="${p.description.slice(0, 150)}"` : null,
  ].filter(Boolean);
  return bits.join(" | ");
}

function asArray(v: unknown): Array<Record<string, unknown>> {
  return Array.isArray(v) ? v : [];
}
function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonError(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });
}
