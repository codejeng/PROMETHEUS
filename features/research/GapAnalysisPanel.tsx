"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  Card,
  Typography,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { EmptyState } from "@/components/common/EmptyState";
import { useAIStore } from "@/store/useAIStore";
import { GapAnalysisReport } from "@/types";
import { useT } from "@/hooks/useT";
import toast from "react-hot-toast";

export function GapAnalysisPanel() {
  const t = useT("research");
  const apiKey = useAIStore((s) => s.apiKey);
  const baseURL = useAIStore((s) => s.baseURL);
  const model = useAIStore((s) => s.model);
  const aiStatus = useAIStore((s) => s.status);
  const hasApiKey = aiStatus === "connected" && apiKey.length > 0;

  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GapAnalysisReport | null>(null);

  async function runAnalysis() {
    if (!topic.trim() || !hasApiKey) return;
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/research/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), apiKey, baseURL, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("gapAnalysisError"));
      setReport(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("gapAnalysisError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
          {t("gapTopicLabel")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            fullWidth
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
            placeholder={t("gapTopicPlaceholder")}
            disabled={!hasApiKey}
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
            onClick={runAnalysis}
            disabled={!topic.trim() || !hasApiKey || loading}
            sx={{ minWidth: 160 }}
            startIcon={loading ? <CircularProgress size={15} sx={{ color: "inherit" }} /> : undefined}
          >
            {loading ? t("gapAnalyzing") : t("gapRunAnalysis")}
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
        <EmptyState icon={TravelExploreOutlinedIcon} title={t("gapEmptyTitle")} description={t("gapEmptyDesc")} />
      )}

      {report && (
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {t("gapCurrentState")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {report.currentState}
            </Typography>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
              {t("gapOpenProblems")}
            </Typography>
            <List dense disablePadding>
              {report.openProblems.map((p, i) => (
                <ListItem key={i} disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemText
                    primary={p}
                    slotProps={{ primary: { variant: "body2", sx: { color: "text.secondary" } } }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
              {t("gapTopLabs")}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {report.topLabs.map((lab, i) => (
                <Chip key={i} label={lab} size="small" variant="outlined" />
              ))}
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
              {t("gapMostCited")}
            </Typography>
            <Stack spacing={1.5}>
              {report.mostCitedPapers.map((p) => (
                <Box key={p.id} sx={{ pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {p.title}
                    </Typography>
                    {p.url && (
                      <Button
                        size="small"
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ minWidth: 0, p: 0.5 }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 14 }} />
                      </Button>
                    )}
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
                    {p.authors.slice(0, 3).join(", ")}
                    {p.authors.length > 3 ? " et al." : ""}
                    {p.year ? ` · ${p.year}` : ""}
                    {typeof p.citationCount === "number" ? ` · ${p.citationCount} citations` : ""}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
              {t("gapReadingOrder")}
            </Typography>
            <Stack spacing={1.5}>
              {report.readingOrder.map((item, i) => (
                <Stack key={item.paper.id + i} direction="row" spacing={1.5}>
                  <Chip label={i + 1} size="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.paper.title}
                      </Typography>
                      {item.paper.url && (
                        <Button
                          size="small"
                          href={item.paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ minWidth: 0, p: 0.5 }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {item.reason}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
              {t("gapThesisIdeas")}
            </Typography>
            <List dense disablePadding>
              {report.thesisIdeas.map((idea, i) => (
                <ListItem key={i} disableGutters sx={{ alignItems: "flex-start" }}>
                  <ListItemText
                    primary={idea}
                    slotProps={{ primary: { variant: "body2", sx: { color: "text.secondary" } } }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
