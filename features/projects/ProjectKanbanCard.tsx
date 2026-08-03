import { Card, Typography, LinearProgress, Stack, Chip } from "@mui/material";
import { Project } from "@/types";

export function ProjectKanbanCard({
  project,
  onClick,
  onDragStart,
}: {
  project: Project;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const doneTasks = project.tasks.filter((t) => t.done).length;

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      sx={{
        p: 2,
        mb: 1.5,
        cursor: "grab",
        "&:hover": { borderColor: "primary.main" },
        "&:active": { cursor: "grabbing" },
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.75 }}>
        {project.title}
      </Typography>
      {project.overview && (
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem", mb: 1 }}>
          {project.overview.slice(0, 80)}
          {project.overview.length > 80 ? "…" : ""}
        </Typography>
      )}
      <LinearProgress variant="determinate" value={project.progress} sx={{ height: 4, borderRadius: 2, mb: 1 }} />
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {project.progress}%
        </Typography>
        {project.tasks.length > 0 && (
          <Chip label={`${doneTasks}/${project.tasks.length} tasks`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
        )}
      </Stack>
    </Card>
  );
}
