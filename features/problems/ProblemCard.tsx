import { Card, Typography, Chip, Stack } from "@mui/material";
import { Problem } from "@/types";

const domainColor: Record<string, string> = {
  Energy: "#E0B15C",
  Fusion: "#D97C6B",
  Climate: "#7FB77E",
  Intelligence: "#8FB2C9",
  Education: "#B39DDB",
  Biology: "#81C995",
  Longevity: "#F48FB1",
  Space: "#90CAF9",
  Manufacturing: "#CE93D8",
  Robotics: "#FFB74D",
  Medicine: "#4FC3F7",
};

export function ProblemCard({ problem, onClick }: { problem: Problem; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
      }}
    >
      <Chip
        label={problem.domain}
        size="small"
        sx={{
          alignSelf: "flex-start",
          bgcolor: `${domainColor[problem.domain] ?? "#888"}22`,
          color: domainColor[problem.domain] ?? "#888",
          fontWeight: 600,
        }}
      />
      <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 600, fontSize: "1.15rem" }}>
        {problem.title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
        {problem.description.slice(0, 150)}
        {problem.description.length > 150 ? "…" : ""}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {problem.researchLabs.length} labs · {problem.existingCompanies.length} companies · {problem.ideas.length} ideas
        </Typography>
      </Stack>
    </Card>
  );
}
