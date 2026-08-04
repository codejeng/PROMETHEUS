"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { useJournalStore } from "@/store/useJournalStore";
import { computeJournalStreak } from "@/lib/dashboardStats";
import { JournalEntryCard } from "./JournalEntryCard";
import { JournalDialog } from "./JournalDialog";
import { JournalEntry } from "@/types";
import { useT } from "@/hooks/useT";

export function JournalPage() {
  const t = useT("journal");
  const items = useJournalStore((s) => s.items);
  const hydrated = useJournalStore((s) => s.hydrated);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<JournalEntry | null>(() => items.find((j) => j.id === initialId) ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const streak = computeJournalStreak(items);
  const totalDeepWork = items.reduce((s, j) => s + j.deepWorkHours, 0);
  const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelected(null); setDialogOpen(true); }}>
            {t("newEntry")}
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <StatCard label={t("currentStreak")} value={`${streak} ${streak === 1 ? "day" : "days"}`} icon={LocalFireDepartmentOutlinedIcon} accent="warning" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard label={t("totalDeepWork")} value={`${totalDeepWork.toFixed(1)}h`} icon={EditNoteOutlinedIcon} />
        </Box>
      </Stack>

      {!hydrated ? (
        <LoadingState />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={EditNoteOutlinedIcon}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Stack spacing={2}>
          {sorted.map((e) => (
            <JournalEntryCard key={e.id} entry={e} onClick={() => { setSelected(e); setDialogOpen(true); }} />
          ))}
        </Stack>
      )}

      <JournalDialog open={dialogOpen} onClose={() => setDialogOpen(false)} entry={selected} />
    </Box>
  );
}
