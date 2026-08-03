import { Box, Stack, Chip, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ResearchSource } from "@/types";

type StepStatus = "idle" | "active" | "ok" | "error" | "empty";

interface Step {
  label: string;
  status: StepStatus;
}

const sourceLabel: Record<ResearchSource, string> = {
  arxiv: "arXiv",
  semanticScholar: "Semantic Scholar",
  openAlex: "OpenAlex",
  crossref: "Crossref",
};

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "ok") return <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "success.main" }} />;
  if (status === "error") return <ErrorOutlineIcon sx={{ fontSize: 15, color: "error.main" }} />;
  if (status === "empty") return <RadioButtonUncheckedIcon sx={{ fontSize: 15, color: "text.disabled" }} />;
  return null;
}

export function PipelineFlow({
  phase,
  sourceStatus,
}: {
  phase: "idle" | "searching" | "done";
  sourceStatus?: Record<ResearchSource, "ok" | "error" | "empty">;
}) {
  const sourceSteps: Step[] = (["arxiv", "semanticScholar", "openAlex", "crossref"] as ResearchSource[]).map((s) => ({
    label: sourceLabel[s],
    status: phase === "idle" ? "idle" : phase === "searching" ? "active" : sourceStatus?.[s] ?? "idle",
  }));

  const stages: Step[] = [
    { label: "Search Planner", status: phase === "idle" ? "idle" : "ok" },
  ];
  const afterStages: Step[] = [
    { label: "Retrieve", status: phase === "done" ? "ok" : phase === "searching" ? "active" : "idle" },
    { label: "Score Relevance", status: phase === "done" ? "ok" : "idle" },
  ];

  function Pill({ step }: { step: Step }) {
    return (
      <Chip
        size="small"
        icon={<StatusIcon status={step.status} />}
        label={step.label}
        variant={step.status === "idle" ? "outlined" : "filled"}
        sx={{
          fontWeight: 500,
          bgcolor:
            step.status === "ok"
              ? "success.main"
              : step.status === "error"
              ? "error.main"
              : step.status === "active"
              ? "primary.main"
              : "transparent",
          color: step.status === "idle" || step.status === "empty" ? "text.secondary" : undefined,
          opacity: step.status === "empty" ? 0.5 : 1,
          "& .MuiChip-icon": { color: "inherit" },
        }}
      />
    );
  }

  return (
    <Box sx={{ overflowX: "auto", pb: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="nowrap" sx={{ minWidth: "max-content" }}>
        {stages.map((s) => (
          <Pill key={s.label} step={s} />
        ))}
        <ArrowForwardIcon sx={{ fontSize: 14, color: "text.disabled" }} />
        {sourceSteps.map((s, i) => (
          <Stack key={s.label} direction="row" alignItems="center" spacing={1}>
            <Pill step={s} />
            {i < sourceSteps.length - 1 && <Typography sx={{ color: "text.disabled", fontSize: 12 }}>·</Typography>}
          </Stack>
        ))}
        <ArrowForwardIcon sx={{ fontSize: 14, color: "text.disabled" }} />
        {afterStages.map((s) => (
          <Pill key={s.label} step={s} />
        ))}
      </Stack>
    </Box>
  );
}
