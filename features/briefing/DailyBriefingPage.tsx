"use client";

import { useState } from "react";
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
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useAIStore } from "@/store/useAIStore";
import { DailyBriefingReport } from "@/types";
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

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function DailyBriefingPage() {
  const t = useT("briefing");
  const theme = useTheme();
  const apiKey = useAIStore((s) => s.apiKey);
  const baseURL = useAIStore((s) => s.baseURL);
  const model = useAIStore((s) => s.model);
  const aiStatus = useAIStore((s) => s.status);
  const hasApiKey = aiStatus === "connected" && apiKey.length > 0;

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DailyBriefingReport | null>(null);

  async function runBriefing() {
    if (!hasApiKey) return;
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/research/daily-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, baseURL, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("error"));
      setReport(data);
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
              <Card sx={{ p: 0 }}>
                <Stack divider={<Divider />}>
                  {report.topPapers.map((sp) => (
                    <Box key={sp.paper.id} sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{sp.paper.title}</Typography>
                        {sp.paper.url && (
                          <Button size="small" href={sp.paper.url} target="_blank" rel="noopener noreferrer" sx={{ minWidth: 0, p: 0.25 }}>
                            <OpenInNewIcon sx={{ fontSize: 13 }} />
                          </Button>
                        )}
                      </Stack>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        {sp.paper.authors.slice(0, 3).join(", ")}
                        {sp.paper.authors.length > 3 ? " et al." : ""}
                        {sp.paper.publishedDate ? ` · ${formatDate(sp.paper.publishedDate)}` : ""}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>{sp.whyItMatters}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Box>
          )}

          {report.topNews.length > 0 && (
            <Box id="news">
              <Typography variant="h5" sx={{ mb: 2 }}>{t("topNews")}</Typography>
              <Card sx={{ p: 0 }}>
                <Stack divider={<Divider />}>
                  {report.topNews.map((sn, i) => (
                    <Box key={sn.item.url + i} sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip label={sn.item.source} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{sn.item.title}</Typography>
                        {sn.item.url && (
                          <Button size="small" href={sn.item.url} target="_blank" rel="noopener noreferrer" sx={{ minWidth: 0, p: 0.25 }}>
                            <OpenInNewIcon sx={{ fontSize: 13 }} />
                          </Button>
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>{sn.whyItMatters}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Box>
          )}

          {report.topProjects.length > 0 && (
            <Box id="projects">
              <Typography variant="h5" sx={{ mb: 2 }}>{t("topProjects")}</Typography>
              <Card sx={{ p: 0 }}>
                <Stack divider={<Divider />}>
                  {report.topProjects.map((sp, i) => (
                    <Box key={sp.project.url + i} sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{sp.project.name}</Typography>
                        <Stack direction="row" spacing={0.4} alignItems="center">
                          <StarBorderOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>{sp.project.stars}</Typography>
                        </Stack>
                        {sp.project.url && (
                          <Button size="small" href={sp.project.url} target="_blank" rel="noopener noreferrer" sx={{ minWidth: 0, p: 0.25 }}>
                            <OpenInNewIcon sx={{ fontSize: 13 }} />
                          </Button>
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>{sp.whyItMatters}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
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
