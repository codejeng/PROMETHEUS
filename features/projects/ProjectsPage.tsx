"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PageHeader } from "@/components/common/PageHeader";
import { useProjectsStore } from "@/store/useProjectsStore";
import { KanbanColumn } from "./KanbanColumn";
import { ProjectDialog } from "./ProjectDialog";
import { Project } from "@/types";
import { useT } from "@/hooks/useT";

const stages: Project["stage"][] = ["Ideas", "Planning", "Research", "Building", "Completed"];
const stageKeys: Record<Project["stage"], string> = {
  Ideas: "stageIdeas",
  Planning: "stagePlanning",
  Research: "stageResearch",
  Building: "stageBuilding",
  Completed: "stageCompleted",
};

export function ProjectsPage() {
  const t = useT("projects");
  const items = useProjectsStore((s) => s.items);
  const update = useProjectsStore((s) => s.update);
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selected, setSelected] = useState<Project | null>(
    () => items.find((p) => p.id === initialId) ?? null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultStage, setDefaultStage] = useState<Project["stage"]>("Ideas");

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
              setDefaultStage("Ideas");
              setDialogOpen(true);
            }}
          >
            {t("newProject")}
          </Button>
        }
      />

      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
        {stages.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            stageLabel={t(stageKeys[stage])}
            projects={items.filter((p) => p.stage === stage)}
            onCardClick={(p) => {
              setSelected(p);
              setDialogOpen(true);
            }}
            onDrop={(id, newStage) => update(id, { stage: newStage })}
            onAdd={() => {
              setSelected(null);
              setDefaultStage(stage);
              setDialogOpen(true);
            }}
          />
        ))}
      </Box>

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        project={selected}
        defaultStage={defaultStage}
      />
    </Box>
  );
}
