"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Grid, Button, Tabs, Tab, Card, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { usePapersStore } from "@/store/usePapersStore";
import { PaperTable } from "./PaperTable";
import { PaperCard } from "./PaperCard";
import { PaperTimeline } from "./PaperTimeline";
import { PaperDialog } from "./PaperDialog";
import { Paper, ReadingStatus } from "@/types";
import { useT } from "@/hooks/useT";

const statusColor: Record<ReadingStatus, string> = {
  "To Read": "#8FB2C9",
  Reading: "#E0B15C",
  Read: "#7FB77E",
  Reference: "#B39DDB",
};

export function ReadingPage() {
  const t = useT("reading");
  const items = usePapersStore((s) => s.items);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<Paper | null>(
    () => items.find((p) => p.id === initialId) ?? null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<"table" | "cards" | "timeline">("table");

  const totalHours = items.reduce((s, p) => s + p.hoursRead, 0);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((p) => map.set(p.category || "Uncategorized", (map.get(p.category || "Uncategorized") ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [items]);

  const statusBreakdown = useMemo(() => {
    const statuses: ReadingStatus[] = ["To Read", "Reading", "Read", "Reference"];
    return statuses.map((s) => ({ name: s, value: items.filter((p) => p.status === s).length }));
  }, [items]);

  function openPaper(p: Paper) {
    setSelected(p);
    setDialogOpen(true);
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            {t("addPaper")}
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={MenuBookOutlinedIcon}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("totalHours")}</Typography>
                <Typography variant="h4" sx={{ fontFamily: "var(--font-playfair), serif", mt: 0.5 }}>
                  {totalHours.toFixed(1)}h
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ p: 3, height: "100%" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>{t("byStatus")}</Typography>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={28} outerRadius={45}>
                      {statusBreakdown.map((s) => (
                        <Cell key={s.name} fill={statusColor[s.name as ReadingStatus]} />
                      ))}
                    </Pie>
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("categories")}</Typography>
                <Typography variant="h4" sx={{ fontFamily: "var(--font-playfair), serif", mt: 0.5 }}>
                  {categories.length}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ mb: 3 }}>
            <Tab value="table" label={t("table")} />
            <Tab value="cards" label={t("cards")} />
            <Tab value="timeline" label={t("timelineView")} />
          </Tabs>

          {view === "table" && <PaperTable papers={items} onRowClick={openPaper} />}
          {view === "cards" && (
            <Grid container spacing={2.5}>
              {items.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <PaperCard paper={p} onClick={() => openPaper(p)} />
                </Grid>
              ))}
            </Grid>
          )}
          {view === "timeline" && <PaperTimeline papers={items} onItemClick={openPaper} />}
        </>
      )}

      <PaperDialog open={dialogOpen} onClose={() => setDialogOpen(false)} paper={selected} />
    </Box>
  );
}
