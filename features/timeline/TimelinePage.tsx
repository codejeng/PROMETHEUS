"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button, Typography, Stack, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { useTimelineStore } from "@/store/useTimelineStore";
import { MilestoneDialog } from "./MilestoneDialog";
import { TimelineMilestone } from "@/types";
import { formatDate } from "@/utils/date";
import { useT } from "@/hooks/useT";

const categoryColor: Record<TimelineMilestone["category"], string> = {
  Education: "#8FB2C9",
  Career: "#E0B15C",
  Research: "#7FB77E",
  Personal: "#F48FB1",
  Milestone: "#D9C9A3",
};

export function TimelinePage() {
  const t = useT("timeline");
  const items = useTimelineStore((s) => s.items);
  const hydrated = useTimelineStore((s) => s.hydrated);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<TimelineMilestone | null>(() => items.find((m) => m.id === initialId) ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sorted = [...items].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelected(null); setDialogOpen(true); }}>
            {t("newMilestone")}
          </Button>
        }
      />

      {!hydrated ? (
        <LoadingState />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={TimelineOutlinedIcon}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Box sx={{ overflowX: "auto", pb: 3 }}>
          <Box sx={{ display: "flex", minWidth: sorted.length * 260, position: "relative", pt: 2 }}>
            <Box sx={{ position: "absolute", left: 0, right: 0, top: 38, height: "1px", bgcolor: "divider" }} />
            {sorted.map((m) => (
              <Box key={m.id} sx={{ width: 260, flexShrink: 0, px: 1.5, position: "relative" }}>
                <Stack alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  {m.done ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: categoryColor[m.category] }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: "text.disabled" }} />
                  )}
                </Stack>
                <Box
                  onClick={() => { setSelected(m); setDialogOpen(true); }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    minHeight: 140,
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Chip
                    label={m.category}
                    size="small"
                    sx={{ bgcolor: `${categoryColor[m.category]}22`, color: categoryColor[m.category], fontWeight: 600, mb: 1 }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.92rem" }}>
                    {m.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled", display: "block", my: 0.5 }}>
                    {formatDate(m.date)}
                  </Typography>
                  {m.description && (
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                      {m.description.slice(0, 80)}
                      {m.description.length > 80 ? "…" : ""}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <MilestoneDialog open={dialogOpen} onClose={() => setDialogOpen(false)} item={selected} />
    </Box>
  );
}
