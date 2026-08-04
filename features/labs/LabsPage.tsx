"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Grid, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { useLabsStore } from "@/store/useLabsStore";
import { LabCard } from "./LabCard";
import { LabDialog } from "./LabDialog";
import { Lab, LabStatus } from "@/types";
import { useT } from "@/hooks/useT";

const statuses: LabStatus[] = ["Dream", "Applying", "Contacted", "Accepted", "Rejected"];

export function LabsPage() {
  const t = useT("labs");
  const items = useLabsStore((s) => s.items);
  const hydrated = useLabsStore((s) => s.hydrated);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<Lab | null>(() => items.find((l) => l.id === initialId) ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelected(null); setDialogOpen(true); }}>
            {t("newLab")}
          </Button>
        }
      />

      {!hydrated ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ScienceOutlinedIcon}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        statuses.map((status) => {
          const labsInStatus = items.filter((l) => l.status === status);
          if (labsInStatus.length === 0) return null;
          return (
            <Box key={status} sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}>
                {status.toUpperCase()} · {labsInStatus.length}
              </Typography>
              <Grid container spacing={2.5}>
                {labsInStatus.map((lab) => (
                  <Grid key={lab.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <LabCard lab={lab} onClick={() => { setSelected(lab); setDialogOpen(true); }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })
      )}

      <LabDialog open={dialogOpen} onClose={() => setDialogOpen(false)} lab={selected} />
    </Box>
  );
}
