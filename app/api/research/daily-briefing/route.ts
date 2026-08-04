import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { sourceSearchers, searchArxiv } from "@/lib/research/sources";
import { fetchAllNews, searchGithubRepos } from "@/lib/research/dailySources";
import { scoreRelevance, dedupeByTitle } from "@/lib/research/relevance";
import {
  DailyBriefingReport,
  ExternalPaperResult,
  GithubProject,
  NewsItem,
  ScoredNewsItem,
  ScoredPaper,
  ScoredProject,
} from "@/types";

export const runtime = "nodejs";

// Kept in sync with the "User Interests" list the daily-briefing spec was
// built from. Primary topics drive the academic + GitHub search queries;
// all of them (primary + secondary) are used to score news relevance.
const PRIMARY_TOPICS = [
  "Nuclear Fusion",
  "Plasma Physics",
  "AI for Science",
  "Artificial Intelligence",
  "Quantum Computing",
  "Robotics",
  "Brain Computer Interface",
  "Space Technology",
  "Advanced Manufacturing",
  "Future Energy",
];
const SECONDARY_TOPICS = [
  "MIT", "Stanford", "ETH Zurich", "EPFL", "Caltech", "Cambridge", "Oxford",
  "Princeton Plasma Physics Laboratory", "ITER", "EUROfusion",
  "OpenAI", "Anthropic", "DeepMind", "NVIDIA", "SpaceX", "Neuralink",
];
const GITHUB_KEYWORDS = [
  "nuclear fusion", "plasma physics", "quantum computing", "robotics", "brain computer interface", "AI for science",
];

const LOOKBACK_DAYS = 3; // "last 24h" is too thin across 10 niche topics in practice; see CONTEXT.md
const MAX_TOKENS = 6000;

const NOISE_PATTERNS = /sponsored|advertisement|partner content|press release/i;

interface DailyBriefingRequestBody {
  apiKey: string;
  baseURL: string;
  model: string;
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

const SYSTEM_PROMPT = `You are a research analyst producing a daily intelligence briefing for a researcher \
focused on: ${PRIMARY_TOPICS.join(", ")} (institutions/orgs of interest: ${SECONDARY_TOPICS.join(", ")}).

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

export async function POST(req: NextRequest) {
  const body: DailyBriefingRequestBody = await req.json();
  const { apiKey, baseURL, model } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!baseURL || !model) {
    return NextResponse.json({ error: "Missing provider base URL or model" }, { status: 400 });
  }

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 3600 * 1000);
  const sinceISODate = since.toISOString().slice(0, 10);

  const [papers, newsResult, projects] = await Promise.all([
    fetchRecentPapers(since),
    fetchAllNews(),
    fetchRecentProjects(sinceISODate),
  ]);

  const recentNews = newsResult.items.filter(
    (n) => !NOISE_PATTERNS.test(n.title) && (!n.publishedDate || new Date(n.publishedDate) >= since)
  );
  const interestQuery = [...PRIMARY_TOPICS, ...SECONDARY_TOPICS].join(" ");
  const relevantNews = recentNews
    .map((n) => ({ n, score: scoreRelevance(interestQuery, { title: n.title, abstract: n.snippet }) }))
    .filter((x) => x.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((x) => x.n);

  const candidatePapers: CandidatePaper[] = papers.slice(0, 25).map((p, i) => ({ id: `paper:${i}`, paper: p }));
  const candidateNews: CandidateNews[] = relevantNews.map((n, i) => ({ id: `news:${i}`, item: n }));
  const candidateProjects: CandidateProject[] = projects.slice(0, 15).map((p, i) => ({ id: `gh:${i}`, project: p }));

  const totalCandidates = candidatePapers.length + candidateNews.length + candidateProjects.length;

  if (totalCandidates < 3) {
    const quiet: DailyBriefingReport = emptyReport(
      "Today is relatively quiet. Nothing significant happened in your research domains."
    );
    return NextResponse.json(quiet);
  }

  const candidateBlock = [
    "Papers:",
    ...candidatePapers.map((c) => formatPaperCandidate(c)),
    "",
    "News:",
    ...candidateNews.map((c) => formatNewsCandidate(c)),
    "",
    "GitHub projects:",
    ...candidateProjects.map((c) => formatProjectCandidate(c)),
  ].join("\n");

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
          { role: "user", content: candidateBlock },
        ],
      });
      content = response.choices[0]?.message?.content;
    } catch {
      const response = await client.chat.completions.create({
        model,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: candidateBlock },
        ],
      });
      content = response.choices[0]?.message?.content;
    }

    if (!content) {
      return NextResponse.json({ error: "No briefing was returned." }, { status: 502 });
    }

    const parsed = extractJSON(content);
    if (!parsed) {
      return NextResponse.json({ error: "The model's response wasn't valid JSON." }, { status: 502 });
    }

    if (parsed.isQuiet) {
      const quiet = emptyReport(
        typeof parsed.quietMessage === "string" && parsed.quietMessage
          ? parsed.quietMessage
          : "Today is relatively quiet. Nothing significant happened in your research domains."
      );
      return NextResponse.json(quiet);
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

    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json({ error: describeError(err) }, { status: 502 });
  }
}

async function fetchRecentPapers(since: Date): Promise<ExternalPaperResult[]> {
  const query = PRIMARY_TOPICS.map((t) => `"${t}"`).join(" OR ");
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

async function fetchRecentProjects(sinceISODate: string): Promise<GithubProject[]> {
  const settled = await Promise.allSettled(GITHUB_KEYWORDS.map((kw) => searchGithubRepos(kw, sinceISODate, 5)));
  const seen = new Set<string>();
  const out: GithubProject[] = [];
  settled.forEach((result) => {
    if (result.status !== "fulfilled") return;
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
