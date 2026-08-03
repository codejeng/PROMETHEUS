import { useState } from "react";
import { Box, Typography, IconButton, Chip, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Project } from "@/types";
import { ProjectKanbanCard } from "./ProjectKanbanCard";

export function KanbanColumn({
  stage,
  stageLabel,
  projects,
  onCardClick,
  onDrop,
  onAdd,
}: {
  stage: Project["stage"];
  stageLabel: string;
  projects: Project[];
  onCardClick: (p: Project) => void;
  onDrop: (id: string, stage: Project["stage"]) => void;
  onAdd: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const id = e.dataTransfer.getData("text/project-id");
        if (id) onDrop(id, stage);
      }}
      sx={{
        width: 280,
        flexShrink: 0,
        borderRadius: 3,
        bgcolor: dragOver ? "action.hover" : "transparent",
        border: "1px dashed",
        borderColor: dragOver ? "primary.main" : "transparent",
        p: 1,
        transition: "background-color 150ms ease, border-color 150ms ease",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {stageLabel}
          </Typography>
          <Chip label={projects.length} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
        </Stack>
        <IconButton size="small" onClick={onAdd}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ minHeight: 80 }}>
        {projects.map((p) => (
          <ProjectKanbanCard
            key={p.id}
            project={p}
            onClick={() => onCardClick(p)}
            onDragStart={(e) => e.dataTransfer.setData("text/project-id", p.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
