import { XMLParser } from "fast-xml-parser";
import { GithubProject, NewsItem, NewsSource } from "@/types";

// Same policy as lib/research/sources.ts: only public, ToS-compliant
// endpoints. RSS feeds are how we cover industry/lab news without scraping —
// no headless browser, no bypassing bot detection. GitHub uses the official
// Search API. Sources with no API or RSS (DeepMind/OpenAI/Anthropic
// research blogs, PPPL, ITER, EUROfusion, IEEE, ACM, Nature/Science full
// text) are intentionally excluded — see CONTEXT.md.

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, headers: { "User-Agent": "PROMETHEUS-research-agent" } });
  } finally {
    clearTimeout(timeout);
  }
}

// Stanford News (news.stanford.edu/feed/) returns 403 to every User-Agent —
// bot-protected at the infra level. Not worked around; see the no-scraping
// policy note at the top of this file.
const RSS_FEEDS: Array<{ name: NewsSource; url: string }> = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "VentureBeat", url: "https://venturebeat.com/feed/" },
  { name: "MIT News", url: "https://news.mit.edu/rss/research" },
];

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchRssFeed(feed: { name: NewsSource; url: string }): Promise<NewsItem[]> {
  const res = await fetchWithTimeout(feed.url);
  if (!res.ok) throw new Error(`${feed.name} feed responded ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", htmlEntities: true });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items.map((it: Record<string, unknown>): NewsItem => {
    const pubDate = typeof it.pubDate === "string" ? it.pubDate : undefined;
    const description = typeof it.description === "string" ? stripHtml(it.description) : undefined;
    return {
      title: stripHtml(String(it.title ?? "")),
      source: feed.name,
      url: String(it.link ?? ""),
      publishedDate: pubDate ? new Date(pubDate).toISOString() : undefined,
      snippet: description?.slice(0, 300),
    };
  });
}

/** Fetches all RSS sources in parallel; a single feed failing doesn't fail the rest. */
export async function fetchAllNews(): Promise<{ items: NewsItem[]; errors: Partial<Record<NewsSource, string>> }> {
  const settled = await Promise.allSettled(RSS_FEEDS.map(fetchRssFeed));
  const items: NewsItem[] = [];
  const errors: Partial<Record<NewsSource, string>> = {};
  settled.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      errors[RSS_FEEDS[i].name] = result.reason instanceof Error ? result.reason.message : "Unknown error";
    }
  });
  return { items, errors };
}

/**
 * GitHub's official Search API has no "trending" endpoint, so this is a
 * proxy: repos matching the keyword with recent push activity, sorted by
 * stars. Not identical to github.com/trending, but real data via the
 * documented API — no scraping the trending HTML page.
 */
export async function searchGithubRepos(keyword: string, sinceISODate: string, limit = 5): Promise<GithubProject[]> {
  const q = `${keyword} pushed:>${sinceISODate}`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${limit}`;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  // Unauthenticated GitHub Search API is capped at 10 req/min, which a
  // multi-keyword briefing burns through immediately. An optional token
  // raises that to 30 req/min. See .env.local.example.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetchWithTimeout(url, { headers });
  if (!res.ok) throw new Error(`GitHub search responded ${res.status}`);
  const data = await res.json();
  const items: Array<Record<string, unknown>> = data.items ?? [];

  return items.map((r): GithubProject => ({
    name: String(r.full_name ?? ""),
    url: String(r.html_url ?? ""),
    description: typeof r.description === "string" ? r.description : "",
    stars: typeof r.stargazers_count === "number" ? r.stargazers_count : 0,
    language: typeof r.language === "string" ? r.language : undefined,
  }));
}
