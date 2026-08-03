import { ExternalPaperResult } from "@/types";

const STOPWORDS = new Set([
  "a", "an", "the", "of", "for", "and", "or", "in", "on", "to", "with", "how",
  "can", "is", "are", "does", "do", "using", "via", "into", "from", "by",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Deterministic keyword-overlap relevance score (0-1) between the research
 * goal and a candidate paper's title + abstract. This is a real, explainable
 * ranking signal — not a placeholder for an LLM call, which is a separate,
 * clearly-gated stage (see ResearchEnginePage).
 */
export function scoreRelevance(query: string, paper: Pick<ExternalPaperResult, "title" | "abstract">): number {
  const queryTerms = new Set(tokenize(query));
  if (queryTerms.size === 0) return 0;

  const titleTerms = tokenize(paper.title ?? "");
  const abstractTerms = tokenize(paper.abstract ?? "");

  let titleHits = 0;
  titleTerms.forEach((t) => {
    if (queryTerms.has(t)) titleHits += 1;
  });
  let abstractHits = 0;
  const seenAbstract = new Set<string>();
  abstractTerms.forEach((t) => {
    if (queryTerms.has(t) && !seenAbstract.has(t)) {
      abstractHits += 1;
      seenAbstract.add(t);
    }
  });

  // Title matches count double — a query term appearing in the title is a
  // stronger signal than the same term appearing once in a long abstract.
  const score = (titleHits * 2 + abstractHits) / (queryTerms.size * 2);
  return Math.max(0, Math.min(1, score));
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Removes duplicate papers retrieved from multiple sources, keeping the first (highest-priority source) occurrence. */
export function dedupeByTitle(results: ExternalPaperResult[]): ExternalPaperResult[] {
  const seen = new Set<string>();
  const out: ExternalPaperResult[] = [];
  for (const r of results) {
    const key = normalizeTitle(r.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}
