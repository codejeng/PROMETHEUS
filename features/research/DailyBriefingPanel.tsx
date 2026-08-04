"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Typography,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
} from "@mui/material";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { EmptyState } from "@/components/common/EmptyState";
import { useAIStore } from "@/store/useAIStore";
import { DailyBriefingReport } from "@/types";
import { useT } from "@/hooks/useT";
import { formatDate } from "@/utils/date";
import toast from "react-hot-toast";

export function DailyBriefingPanel() {
  const t = useT("research");
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
      if (!res.ok) throw new Error(data.error ?? t("briefingError"));
      setReport(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("briefingError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t("briefingTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              {t("briefingDesc")}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={runBriefing}
            disabled={!hasApiKey || loading}
            startIcon={loading ? <CircularProgress size={15} sx={{ color: "inherit" }} /> : undefined}
            sx={{ minWidth: 200, flexShrink: 0 }}
          >
            {loading ? t("briefingGenerating") : t("briefingGenerate")}
          </Button>
        </Stack>
        {!hasApiKey && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
            <LockOutlinedIcon sx={{ fontSize: 15, color: "warning.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("gapAiGatedDesc")}
            </Typography>
            <Button component={Link} href="/settings" size="small">
              {t("connectToSummarize")}
            </Button>
          </Stack>
        )}
      </Card>

      {!report && !loading && (
        <EmptyState icon={TodayOutlinedIcon} title={t("briefingEmptyTitle")} description={t("briefingEmptyDesc")} />
      )}

      {report?.isQuiet && (
        <EmptyState icon={TodayOutlinedIcon} title={t("briefingQuietTitle")} description={report.quietMessage ?? ""} />
      )}

      {report && !report.isQuiet && (
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t("briefingHighlights")}
              </Typography>
              <Chip label={formatDate(report.date)} size="small" variant="outlined" />
            </Stack>
            <List dense disablePadding>
              {report.highlights.map((h, i) => (
                <ListItem key={i} disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemText primary={h} slotProps={{ primary: { variant: "body2", sx: { color: "text.secondary" } } }} />
                </ListItem>
              ))}
            </List>
          </Card>

          {report.topPapers.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {t("briefingTopPapers")}
              </Typography>
              <Stack spacing={1.75} divider={<Divider />}>
                {report.topPapers.map((sp) => (
                  <Box key={sp.paper.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sp.paper.title}
                      </Typography>
                      {sp.paper.url && (
                        <Button size="small" href={sp.paper.url} target="_blank" rel="noopener noreferrer" sx={{ minWidth: 0, p: 0.5 }}>
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.5 }}>
                      {sp.paper.authors.slice(0, 3).join(", ")}
                      {sp.paper.authors.length > 3 ? " et al." : ""}
                      {sp.paper.publishedDate ? ` · ${formatDate(sp.paper.publishedDate)}` : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{sp.whyItMatters}</Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          )}

          {report.topNews.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {t("briefingTopNews")}
              </Typography>
              <Stack spacing={1.75} divider={<Divider />}>
                {report.topNews.map((sn, i) => (
                  <Box key={sn.item.url + i}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={sn.item.source} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sn.item.title}
                      </Typography>
                      {sn.item.url && (
                        <Button size="small" href={sn.item.url} target="_blank" rel="noopener noreferrer" sx={{ minWidth: 0, p: 0.5 }}>
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ fontSize: "0.85rem", mt: 0.5 }}>{sn.whyItMatters}</Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          )}

          {report.topProjects.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {t("briefingTopProjects")}
              </Typography>
              <Stack spacing={1.75} divider={<Divider />}>
                {report.topProjects.map((sp, i) => (
                  <Box key={sp.project.url + i}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sp.project.name}
                      </Typography>
                      <Stack direction="row" spacing={0.4} alignItems="center">
                        <StarBorderOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>{sp.project.stars}</Typography>
                      </Stack>
                      {sp.project.url && (
                        <Button size="small" href={sp.project.url} target="_blank" rel="noopener noreferrer" sx={{ minWidth: 0, p: 0.5 }}>
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ fontSize: "0.85rem", mt: 0.5 }}>{sp.whyItMatters}</Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          )}

          {report.funding.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>{t("briefingFunding")}</Typography>
              <List dense disablePadding>
                {report.funding.map((f, i) => (
                  <ListItem key={i} disableGutters><ListItemText primary={f} slotProps={{ primary: { variant: "body2", sx: { color: "text.secondary" } } }} /></ListItem>
                ))}
              </List>
            </Card>
          )}

          {report.conferences.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>{t("briefingConferences")}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {report.conferences.map((c, i) => <Chip key={i} label={c} size="small" variant="outlined" />)}
              </Stack>
            </Card>
          )}

          {report.trends.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>{t("briefingTrends")}</Typography>
              <List dense disablePadding>
                {report.trends.map((tr, i) => (
                  <ListItem key={i} disableGutters><ListItemText primary={tr} slotProps={{ primary: { variant: "body2", sx: { color: "text.secondary" } } }} /></ListItem>
                ))}
              </List>
            </Card>
          )}

          {report.researchIdeas.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>{t("briefingResearchIdeas")}</Typography>
              <List dense disablePadding>
                {report.researchIdeas.map((idea, i) => (
                  <ListItem key={i} disableGutters><ListItemText primary={idea} slotProps={{ primary: { variant: "body2", sx: { color: "text.secondary" } } }} /></ListItem>
                ))}
              </List>
            </Card>
          )}

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>{t("briefingGapOfDay")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{report.researchGapOfTheDay}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>{t("briefingQuestion")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{report.questionWorthThinking}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>{t("briefingQuote")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>&ldquo;{report.quoteOfTheDay}&rdquo;</Typography>
              </Box>
            </Stack>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
