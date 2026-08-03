"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Grid, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useQuestionsStore } from "@/store/useQuestionsStore";
import { QuestionCard } from "./QuestionCard";
import { QuestionDialog } from "./QuestionDialog";
import { ResearchQuestion } from "@/types";
import { useT } from "@/hooks/useT";

export function QuestionsPage() {
  const t = useT("questions");
  const items = useQuestionsStore((s) => s.items);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<ResearchQuestion | null>(
    () => items.find((q) => q.id === initialId) ?? null
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
            {t("newQuestion")}
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={HelpOutlineOutlinedIcon}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={2.5}>
          {items.map((q) => (
            <Grid key={q.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <QuestionCard
                item={q}
                onClick={() => {
                  setSelected(q);
                  setDialogOpen(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <QuestionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} item={selected} />
    </Box>
  );
}
