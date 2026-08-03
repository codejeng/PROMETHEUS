import { XMLParser } from "fast-xml-parser";
import { ExternalPaperResult, ResearchSource } from "@/types";

// Every function here hits a public, documented, ToS-compliant REST/Atom API —
// no scraping, no bot-detection bypass, no authenticated/paywalled content.
// Google Scholar (no public API, disallows automated queries) and publisher
// sites like Nature (paywalled HTML) are intentionally excluded; see
// features/research/ResearchEnginePage.tsx for how that's surfaced in the UI.

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchArxiv(query: string, limit = 8): Promise<ExternalPaperResult[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
    query
  )}&start=0&max_results=${limit}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`arXiv responded ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed = parser.parse(xml);
  const rawEntries = parsed?.feed?.entry;
  const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];

  return entries.map((e: Record<string, unknown>): ExternalPaperResult => {
    const idUrl = String(e.id ?? "");
    const arxivId = idUrl.split("/abs/")[1] ?? idUrl;
    const rawAuthors = e.author;
    const authorList = Array.isArray(rawAuthors) ? rawAuthors : rawAuthors ? [rawAuthors] : [];
    const authors = authorList.map((a) => String((a as { name?: string })?.name ?? "")).filter(Boolean);
    const published = typeof e.published === "string" ? e.published : undefined;

    return {
      id: `arxiv:${arxivId}`,
      source: "arxiv",
      title: String(e.title ?? "").replace(/\s+/g, " ").trim(),
      authors,
      year: published ? new Date(published).getFullYear() : undefined,
      abstract: String(e.summary ?? "").replace(/\s+/g, " ").trim(),
      arxivId,
      url: idUrl,
      relevance: 0,
    };
  });
}

export async function searchSemanticScholar(query: string, limit = 8): Promise<ExternalPaperResult[]> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
    query
  )}&limit=${limit}&fields=title,authors,year,abstract,externalIds,url`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Semantic Scholar responded ${res.status}`);
  const data = await res.json();
  const papers: Array<Record<string, unknown>> = data.data ?? [];

  return papers.map((p): ExternalPaperResult => {
    const externalIds = (p.externalIds as Record<string, string>) ?? {};
    return {
      id: `semanticScholar:${p.paperId}`,
      source: "semanticScholar",
      title: String(p.title ?? ""),
      authors: ((p.authors as Array<{ name?: string }>) ?? []).map((a) => a.name ?? "").filter(Boolean),
      year: typeof p.year === "number" ? p.year : undefined,
      abstract: typeof p.abstract === "string" ? p.abstract : undefined,
      doi: externalIds.DOI,
      arxivId: externalIds.ArXiv,
      url: typeof p.url === "string" ? p.url : undefined,
      relevance: 0,
    };
  });
}

export async function searchOpenAlex(query: string, limit = 8): Promise<ExternalPaperResult[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`OpenAlex responded ${res.status}`);
  const data = await res.json();
  const works: Array<Record<string, unknown>> = data.results ?? [];

  return works.map((w): ExternalPaperResult => {
    const authorships = (w.authorships as Array<{ author?: { display_name?: string } }>) ?? [];
    return {
      id: `openAlex:${w.id}`,
      source: "openAlex",
      title: String(w.title ?? w.display_name ?? ""),
      authors: authorships.map((a) => a.author?.display_name ?? "").filter(Boolean),
      year: typeof w.publication_year === "number" ? w.publication_year : undefined,
      abstract: undefined,
      doi: typeof w.doi === "string" ? w.doi.replace("https://doi.org/", "") : undefined,
      url: typeof w.id === "string" ? w.id : undefined,
      relevance: 0,
    };
  });
}

export async function searchCrossref(query: string, limit = 8): Promise<ExternalPaperResult[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Crossref responded ${res.status}`);
  const data = await res.json();
  const items: Array<Record<string, unknown>> = data.message?.items ?? [];

  return items.map((it): ExternalPaperResult => {
    const titleArr = it.title as string[] | undefined;
    const authorsArr = (it.author as Array<{ given?: string; family?: string }>) ?? [];
    const yearParts = (it.issued as { "date-parts"?: number[][] })?.["date-parts"]?.[0];
    return {
      id: `crossref:${it.DOI}`,
      source: "crossref",
      title: titleArr?.[0] ?? "",
      authors: authorsArr.map((a) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean),
      year: yearParts?.[0],
      abstract: typeof it.abstract === "string" ? it.abstract.replace(/<\/?[^>]+>/g, "") : undefined,
      doi: typeof it.DOI === "string" ? it.DOI : undefined,
      url: typeof it.URL === "string" ? it.URL : undefined,
      relevance: 0,
    };
  });
}

export const sourceSearchers: Record<ResearchSource, (query: string, limit?: number) => Promise<ExternalPaperResult[]>> = {
  arxiv: searchArxiv,
  semanticScholar: searchSemanticScholar,
  openAlex: searchOpenAlex,
  crossref: searchCrossref,
};
