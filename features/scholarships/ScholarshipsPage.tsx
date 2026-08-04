"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Grid, Button, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { useScholarshipsStore } from "@/store/useScholarshipsStore";
import { ScholarshipCard } from "./ScholarshipCard";
import { ScholarshipDialog } from "./ScholarshipDialog";
import { ScholarshipCalendar } from "./ScholarshipCalendar";
import { Scholarship } from "@/types";
import { useT } from "@/hooks/useT";

export function ScholarshipsPage() {
  const t = useT("scholarships");
  const items = useScholarshipsStore((s) => s.items);
  const hydrated = useScholarshipsStore((s) => s.hydrated);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<Scholarship | null>(() => items.find((s) => s.id === initialId) ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<"cards" | "calendar">("cards");

  function open(item: Scholarship) {
    setSelected(item);
    setDialogOpen(true);
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelected(null); setDialogOpen(true); }}>
            {t("newScholarship")}
          </Button>
        }
      />

      {!hydrated ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          icon={SchoolOutlinedIcon}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <>
          <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ mb: 3 }}>
            <Tab value="cards" label={t("cards")} />
            <Tab value="calendar" label={t("calendar")} />
          </Tabs>
          {view === "cards" ? (
            <Grid container spacing={2.5}>
              {items.map((s) => (
                <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ScholarshipCard item={s} onClick={() => open(s)} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <ScholarshipCalendar items={items} onItemClick={open} />
          )}
        </>
      )}

      <ScholarshipDialog open={dialogOpen} onClose={() => setDialogOpen(false)} item={selected} />
    </Box>
  );
}
