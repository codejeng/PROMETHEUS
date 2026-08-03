"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Grid, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useProblemsStore } from "@/store/useProblemsStore";
import { ProblemCard } from "./ProblemCard";
import { ProblemDialog } from "./ProblemDialog";
import { Problem } from "@/types";
import { useT } from "@/hooks/useT";

export function ProblemsPage() {
  const t = useT("problems");
  const items = useProblemsStore((s) => s.items);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<Problem | null>(
    () => items.find((p) => p.id === initialId) ?? null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

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
            {t("newProblem")}
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={PublicOutlinedIcon}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={2.5}>
          {items.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProblemCard
                problem={p}
                onClick={() => {
                  setSelected(p);
                  setDialogOpen(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ProblemDialog open={dialogOpen} onClose={() => setDialogOpen(false)} problem={selected} />
    </Box>
  );
}
