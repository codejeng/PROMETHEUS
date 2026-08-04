"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Card,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Autocomplete,
  TextField,
  Tooltip,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useAIStore } from "@/store/useAIStore";
import { useBriefingInterestsStore } from "@/store/useBriefingInterestsStore";
import {
  BriefingStageName,
  BriefingStageStatus,
  BriefingStreamEvent,
  DailyBriefingReport,
  GithubProject,
  NewsItem,
  ScoredNewsItem,
  ScoredPaper,
  ScoredProject,
} from "@/types";
import { useT } from "@/hooks/useT";
import { formatDate } from "@/utils/date";
import toast from "react-hot-toast";

const SECTIONS = [
  { id: "highlights", labelKey: "highlights" },
  { id: "papers", labelKey: "topPapers" },
  { id: "news", labelKey: "topNews" },
  { id: "projects", labelKey: "topProjects" },
  { id: "signals", labelKey: "signalsIdeas" },
  { id: "reflect", labelKey: "reflect" },
] as const;

const STAGE_ORDER: BriefingStageName[] = ["papers", "news", "projects", "ai"];
type StageMap = Record<BriefingStageName, BriefingStageStatus>;
const IDLE_STAGES: StageMap = { papers: "idle", news: "idle", projects: "idle", ai: "idle" };

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StageIcon({ status }: { status: BriefingStageStatus }) {
  if (status === "active") return <CircularProgress size={13} sx={{ color: "primary.main" }} />;
  if (status === "done") return <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "success.main" }} />;
  if (status === "error") return <ErrorOutlineIcon sx={{ fontSize: 15, color: "error.main" }} />;
  return null;
}

export function DailyBriefingPage() {
  const t = useT("briefing");
  const theme = useTheme();
  const apiKey = useAIStore((s) => s.apiKey);
  const baseURL = useAIStore((s) => s.baseURL);
  const model = useAIStore((s) => s.model);
  const aiStatus = useAIStore((s) => s.status);
  const hasApiKey = aiStatus === "connected" && apiKey.length > 0;

  const interests = useBriefingInterestsStore((s) => s.interests);
  const interestsHydrated = useBriefingInterestsStore((s) => s.hydrated);
  const updateInterests = useBriefingInterestsStore((s) => s.update);
  const [editingTopics, setEditingTopics] = useState(false);
  const [draftPrimary, setDraftPrimary] = useState<string[]>([]);
  const [draftSecondary, setDraftSecondary] = useState<string[]>([]);

  useEffect(() => {
    setDraftPrimary(interests.primaryTopics);
    setDraftSecondary(interests.secondaryTopics);
  }, [interests.primaryTopics, interests.secondaryTopics]);

  function saveTopics() {
    updateInterests({ primaryTopics: draftPrimary, secondaryTopics: draftSecondary });
    setEditingTopics(false);
  }

  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<StageMap>(IDLE_STAGES);
  const [report, setReport] = useState<DailyBriefingReport | null>(null);

  async function runBriefing() {
    if (!hasApiKey) return;
    setLoading(true);
    setReport(null);
    setStages(IDLE_STAGES);
    try {
      const res = await fetch("/api/research/daily-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          baseURL,
          model,
          primaryTopics: interests.primaryTopics,
          secondaryTopics: interests.secondaryTopics,
        }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t("error"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fatalError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event: BriefingStreamEvent = JSON.parse(line);
          if (event.stage === "complete") {
            setReport(event.report);
          } else if (event.stage === "fatal") {
            fatalError = event.error;
          } else {
            setStages((prev) => ({ ...prev, [event.stage]: event.status }));
          }
        }
      }
      if (fatalError) throw new Error(fatalError);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  const hasSignals = (report?.trends.length ?? 0) > 0 || (report?.researchIdeas.length ?? 0) > 0;
  const hasFundingOrConferences = (report?.funding.length ?? 0) > 0 || (report?.conferences.length ?? 0) > 0;

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button
            variant="contained"
            onClick={runBriefing}
            disabled={!hasApiKey || loading}
            startIcon={loading ? <CircularProgress size={15} sx={{ color: "inherit" }} /> : <RefreshOutlinedIcon sx={{ fontSize: 18 }} />}
          >
            {loading ? t("generating") : t("generate")}
          </Button>
        }
      />

      {!hasApiKey && (
        <Card sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 1.25 }}>
          <LockOutlinedIcon sx={{ fontSize: 17, color: "warning.main" }} />
          <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
            {t("aiGatedDesc")}
          </Typography>
          <Button component={Link} href="/settings" size="small">
            {t("connectToSummarize")}
          </Button>
        </Card>
      )}

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <TuneOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t("interestsTitle")}</Typography>
          </Stack>
          {editingTopics ? (
            <Button size="small" startIcon={<CheckIcon sx={{ fontSize: 15 }} />} onClick={saveTopics}>
              {t("interestsSave")}
            </Button>
          ) : (
            <Button size="small" onClick={() => setEditingTopics(true)} disabled={!interestsHydrated}>
              {t("interestsEdit")}
            </Button>
          )}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("interestsDesc")}
        </Typography>

        {!editingTopics ? (
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {interests.primaryTopics.map((topic) => (
                <Chip key={topic} label={topic} size="small" />
              ))}
            </Stack>
            {interests.secondaryTopics.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {interests.secondaryTopics.map((topic) => (
                  <Chip key={topic} label={topic} size="small" variant="outlined" />
                ))}
              </Stack>
            )}
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              freeSolo
              size="small"
              options={[]}
              value={draftPrimary}
              onChange={(_, v) => setDraftPrimary(v as string[])}
              renderInput={(params) => (
                <TextField {...params} label={t("interestsPrimaryLabel")} placeholder={t("interestsAddPlaceholder")} />
              )}
            />
            <Autocomplete
              multiple
              freeSolo
              size="small"
              options={[]}
              value={draftSecondary}
              onChange={(_, v) => setDraftSecondary(v as string[])}
              renderInput={(params) => (
                <TextField {...params} label={t("interestsSecondaryLabel")} placeholder={t("interestsAddPlaceholder")} />
              )}
            />
          </Stack>
        )}
      </Card>

      {loading && (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
          {STAGE_ORDER.map((stage, i) => (
            <Stack key={stage} direction="row" alignItems="center" spacing={1.5}>
              <Chip
                size="small"
                icon={stages[stage] === "idle" ? undefined : <StageIcon status={stages[stage]} />}
                label={t(`stage_${stage}`)}
                variant={stages[stage] === "idle" ? "outlined" : "filled"}
                sx={{
                  fontWeight: 500,
                  bgcolor:
                    stages[stage] === "done" ? "success.main" : stages[stage] === "error" ? "error.main" : stages[stage] === "active" ? "primary.main" : "transparent",
                  color: stages[stage] === "idle" ? "text.secondary" : undefined,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
              {i < STAGE_ORDER.length - 1 && <Typography sx={{ color: "text.disabled", fontSize: 12 }}>→</Typography>}
            </Stack>
          ))}
        </Stack>
      )}

      {!report && !loading && (
        <EmptyState icon={TodayOutlinedIcon} title={t("emptyTitle")} description={t("emptyDesc")} />
      )}

      {report?.isQuiet && (
        <EmptyState icon={NightsStayOutlinedIcon} title={t("quietTitle")} description={report.quietMessage ?? ""} />
      )}

      {report && !report.isQuiet && (
        <Stack spacing={4}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ position: "sticky", top: 0, zIndex: 1, py: 1, bgcolor: "background.default" }}>
            {SECTIONS.map((s) => (
              <Chip
                key={s.id}
                label={t(s.labelKey)}
                size="small"
                variant="outlined"
                onClick={() => scrollToSection(s.id)}
                sx={{ cursor: "pointer" }}
              />
            ))}
            <Chip label={formatDate(report.date)} size="small" sx={{ ml: "auto" }} />
          </Stack>

          <Box id="highlights">
            <Typography variant="h5" sx={{ mb: 2 }}>{t("highlights")}</Typography>
            <Stack spacing={1.75}>
              {report.highlights.map((h, i) => (
                <Box key={i} sx={{ pl: 2, borderLeft: "2px solid", borderColor: "primary.main" }}>
                  <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7 }}>{h}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {report.topPapers.length > 0 && (
            <Box id="papers">
              <Typography variant="h5" sx={{ mb: 2 }}>{t("topPapers")}</Typography>
              <Grid container spacing={2}>
                {report.topPapers.map((sp) => (
                  <Grid key={sp.paper.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <PaperCard scored={sp} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {report.topNews.length > 0 && (
            <Box id="news">
              <Typography variant="h5" sx={{ mb: 2 }}>{t("topNews")}</Typography>
              <Grid container spacing={2}>
                {report.topNews.map((sn, i) => (
                  <Grid key={sn.item.url + i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <NewsCard scored={sn} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {report.topProjects.length > 0 && (
            <Box id="projects">
              <Typography variant="h5" sx={{ mb: 2 }}>{t("topProjects")}</Typography>
              <Grid container spacing={2}>
                {report.topProjects.map((sp, i) => (
                  <Grid key={sp.project.url + i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ProjectCard scored={sp} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {(hasSignals || hasFundingOrConferences) && (
            <Box id="signals">
              <Typography variant="h5" sx={{ mb: 2 }}>{t("signalsIdeas")}</Typography>
              <Stack spacing={2}>
                {report.trends.length > 0 && (
                  <Card sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {t("trends")}
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {report.trends.map((tr, i) => (
                        <Typography key={i} variant="body2" sx={{ color: "text.secondary" }}>{tr}</Typography>
                      ))}
                    </Stack>
                  </Card>
                )}
                {report.researchIdeas.length > 0 && (
                  <Card sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {t("researchIdeas")}
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {report.researchIdeas.map((idea, i) => (
                        <Typography key={i} variant="body2" sx={{ color: "text.secondary" }}>{idea}</Typography>
                      ))}
                    </Stack>
                  </Card>
                )}
                {hasFundingOrConferences && (
                  <Card sx={{ p: 2.5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                      {report.funding.length > 0 && (
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {t("funding")}
                          </Typography>
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            {report.funding.map((f, i) => (
                              <Typography key={i} variant="body2" sx={{ color: "text.secondary" }}>{f}</Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {report.conferences.length > 0 && (
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {t("conferences")}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                            {report.conferences.map((c, i) => <Chip key={i} label={c} size="small" variant="outlined" />)}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Box>
          )}

          <Box id="reflect">
            <Card
              sx={{
                p: 3,
                background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.25),
              }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {t("gapOfDay")}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{report.researchGapOfTheDay}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {t("question")}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{report.questionWorthThinking}</Typography>
                </Box>
                <Divider />
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <FormatQuoteOutlinedIcon sx={{ fontSize: 22, color: "primary.main", flexShrink: 0, mt: 0.25 }} />
                  <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 500, fontStyle: "italic" }}>
                    {report.quoteOfTheDay}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

function CardOpenLink({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <Tooltip title={url}>
      <IconButton size="small" href={url} target="_blank" rel="noopener noreferrer" sx={{ ml: "auto" }}>
        <OpenInNewIcon sx={{ fontSize: 15 }} />
      </IconButton>
    </Tooltip>
  );
}

function PaperCard({ scored }: { scored: ScoredPaper }) {
  const p = scored.paper;
  return (
    <Card sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
      <Stack direction="row" alignItems="center">
        <Chip label={p.source} size="small" sx={{ height: 18, fontSize: "0.62rem" }} />
        <CardOpenLink url={p.url} />
      </Stack>
      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.92rem" }}>{p.title}</Typography>
      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {p.authors.slice(0, 2).join(", ")}
        {p.authors.length > 2 ? " et al." : ""}
        {p.publishedDate ? ` · ${formatDate(p.publishedDate)}` : ""}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", flex: 1 }}>{scored.whyItMatters}</Typography>
    </Card>
  );
}

function NewsCard({ scored }: { scored: ScoredNewsItem }) {
  const n: NewsItem = scored.item;
  return (
    <Card sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
      <Stack direction="row" alignItems="center">
        <Chip label={n.source} size="small" sx={{ height: 18, fontSize: "0.62rem" }} />
        <CardOpenLink url={n.url} />
      </Stack>
      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.92rem" }}>{n.title}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", flex: 1 }}>{scored.whyItMatters}</Typography>
    </Card>
  );
}

function ProjectCard({ scored }: { scored: ScoredProject }) {
  const p: GithubProject = scored.project;
  return (
    <Card sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {p.language && <Chip label={p.language} size="small" sx={{ height: 18, fontSize: "0.62rem" }} />}
        <Stack direction="row" spacing={0.4} alignItems="center">
          <StarBorderOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          <Typography variant="caption" sx={{ color: "text.disabled" }}>{p.stars}</Typography>
        </Stack>
        <CardOpenLink url={p.url} />
      </Stack>
      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.92rem" }}>{p.name}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", flex: 1 }}>{scored.whyItMatters}</Typography>
    </Card>
  );
}
