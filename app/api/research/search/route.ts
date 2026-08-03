import { NextRequest, NextResponse } from "next/server";
import { sourceSearchers } from "@/lib/research/sources";
import { scoreRelevance, dedupeByTitle } from "@/lib/research/relevance";
import { ExternalPaperResult, ResearchSearchResponse, ResearchSource } from "@/types";

export const runtime = "nodejs";

const SOURCES: ResearchSource[] = ["arxiv", "semanticScholar", "openAlex", "crossref"];

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  const sourceStatus: ResearchSearchResponse["sourceStatus"] = {
    arxiv: "empty",
    semanticScholar: "empty",
    openAlex: "empty",
    crossref: "empty",
  };
  const errors: ResearchSearchResponse["errors"] = {};

  const settled = await Promise.allSettled(
    SOURCES.map((source) => sourceSearchers[source](query, 8))
  );

  let combined: ExternalPaperResult[] = [];
  settled.forEach((result, i) => {
    const source = SOURCES[i];
    if (result.status === "fulfilled") {
      sourceStatus[source] = result.value.length > 0 ? "ok" : "empty";
      combined = combined.concat(result.value);
    } else {
      sourceStatus[source] = "error";
      errors[source] = result.reason instanceof Error ? result.reason.message : "Unknown error";
    }
  });

  const scored = combined.map((p) => ({ ...p, relevance: scoreRelevance(query, p) }));
  const deduped = dedupeByTitle(scored).sort((a, b) => b.relevance - a.relevance);

  const response: ResearchSearchResponse = {
    query,
    results: deduped,
    sourceStatus,
    errors,
  };

  return NextResponse.json(response);
}
