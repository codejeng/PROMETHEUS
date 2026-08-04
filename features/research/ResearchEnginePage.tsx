"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  Typography,
  Stack,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PipelineFlow } from "./PipelineFlow";
import { ResearchResultCard, GeneratedSummary } from "./ResearchResultCard";
import { GapAnalysisPanel } from "./GapAnalysisPanel";
import { usePapersStore } from "@/store/usePapersStore";
import { useAIStore } from "@/store/useAIStore";
import { ExternalPaperResult, ResearchSearchResponse } from "@/types";
import { useT } from "@/hooks/useT";
import toast from "react-hot-toast";

export function ResearchEnginePage() {
  const t = useT("research");
  const papers = usePapersStore((s) => s.items);
  const addPaper = usePapersStore((s) => s.add);
  const apiKey = useAIStore((s) => s.apiKey);
  const baseURL = useAIStore((s) => s.baseURL);
  const model = useAIStore((s) => s.model);
  const aiStatus = useAIStore((s) => s.status);
  const hasApiKey = aiStatus === "connected" && apiKey.length > 0;

  const [tab, setTab] = useState<"search" | "gap">("search");
  const [goal, setGoal] = useState("");
  const [phase, setPhase] = useState<"idle" | "searching" | "done">("idle");
  const [response, setResponse] = useState<ResearchSearchResponse | null>(null);
  const [summaries, setSummaries] = useState<Record<string, GeneratedSummary>>({});
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const addedKeys = new Set(
    papers.flatMap((p) => [p.arxivId, p.doi].filter(Boolean) as string[])
  );

  function isAlreadyAdded(p: ExternalPaperResult): boolean {
    return Boolean((p.arxivId && addedKeys.has(p.arxivId)) || (p.doi && addedKeys.has(p.doi)));
  }

  async function runSearch() {
    if (!goal.trim()) return;
    setPhase("searching");
    setResponse(null);
    setSummaries({});
    try {
      const res = await fetch(`/api/research/search?q=${encodeURIComponent(goal.trim())}`);
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data: ResearchSearchResponse = await res.json();
      setResponse(data);
      setPhase("done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
      setPhase("idle");
    }
  }

  async function handleSummarize(p: ExternalPaperResult) {
    if (!hasApiKey) return;
    setSummarizingId(p.id);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, baseURL, model, title: p.title, authors: p.authors, abstract: p.abstract }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("summarizeError"));
      setSummaries((prev) => ({ ...prev, [p.id]: data }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("summarizeError"));
    } finally {
      setSummarizingId(null);
    }
  }

  function handleAdd(p: ExternalPaperResult) {
    const generated = summaries[p.id];
    addPaper({
      title: p.title,
      authors: p.authors,
      arxivId: p.arxivId,
      doi: p.doi,
      pdfLink: p.url,
      category: "",
      difficulty: "Moderate",
      status: "To Read",
      summary: generated?.summary ?? p.abstract ?? "",
      keyInsight: generated?.keyInsight ?? "",
      questions: "",
      critique: "",
      ideasGenerated: "",
      relatedProjectIds: [],
      knowledgeTags: [],
      hoursRead: 0,
    });
    toast.success(`"${p.title.slice(0, 40)}${p.title.length > 40 ? "…" : ""}" added to Reading`);
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <ToggleButtonGroup
        value={tab}
        exclusive
        onChange={(_, v) => v && setTab(v)}
        size="small"
        sx={{ mb: 3 }}
      >
        <ToggleButton value="search">{t("tabSearch")}</ToggleButton>
        <ToggleButton value="gap">{t("tabGapAnalysis")}</ToggleButton>
      </ToggleButtonGroup>

      {tab === "gap" ? (
        <GapAnalysisPanel />
      ) : (
        <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
          {t("goalLabel")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
          <TextField
            fullWidth
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder={t("goalPlaceholder")}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <TravelExploreOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="contained"
            onClick={runSearch}
            disabled={!goal.trim() || phase === "searching"}
            sx={{ minWidth: 140 }}
          >
            {phase === "searching" ? t("searching") : t("runSearch")}
          </Button>
        </Stack>
        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 1 }}>
          {t("pipeline")}
        </Typography>
        <PipelineFlow phase={phase} sourceStatus={response?.sourceStatus} />
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
            {t("resultsTitle")}
            {response ? ` (${response.results.length})` : ""}
          </Typography>
          {!response || response.results.length === 0 ? (
            <EmptyState
              icon={TravelExploreOutlinedIcon}
              title={t("resultsTitle")}
              description={t("noResultsYet")}
            />
          ) : (
            <Stack spacing={2}>
              {response.results.map((p) => (
                <ResearchResultCard
                  key={p.id}
                  paper={p}
                  alreadyAdded={isAlreadyAdded(p)}
                  onAdd={() => handleAdd(p)}
                  addLabel={t("addToReading")}
                  addedLabel={t("alreadyAdded")}
                  relevanceLabel={t("relevance")}
                  canSummarize={hasApiKey}
                  summarizeLabel={hasApiKey ? t("summarize") : t("connectToSummarize")}
                  summarizingLabel={t("summarizing")}
                  keyInsightLabel={t("keyInsightLabel")}
                  summarizing={summarizingId === p.id}
                  summary={summaries[p.id]}
                  onSummarize={() => handleSummarize(p)}
                />
              ))}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <LockOutlinedIcon sx={{ fontSize: 17, color: hasApiKey ? "success.main" : "warning.main" }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t("aiGatedTitle")}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                {t("aiGatedDesc")}
              </Typography>
              {!hasApiKey && (
                <Button component={Link} href="/settings" size="small" sx={{ mt: 1.5 }}>
                  {t("connectToSummarize")}
                </Button>
              )}
            </Card>
            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 17, color: "info.main" }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t("excludedTitle")}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                {t("excludedDesc")}
              </Typography>
            </Card>
          </Stack>
        </Grid>
      </Grid>
        </>
      )}
    </Box>
  );
}
