import { Card, Typography, Chip, Stack } from "@mui/material";
import { ResearchQuestion } from "@/types";

const difficultyColor: Record<string, string> = {
  Approachable: "#7FB77E",
  Moderate: "#8FB2C9",
  Hard: "#E0B15C",
  Frontier: "#D97C6B",
};

export function QuestionCard({ item, onClick }: { item: ResearchQuestion; onClick: () => void }) {
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
        label={item.difficulty}
        size="small"
        sx={{
          alignSelf: "flex-start",
          bgcolor: `${difficultyColor[item.difficulty]}22`,
          color: difficultyColor[item.difficulty],
          fontWeight: 600,
        }}
      />
      <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 600, fontSize: "1.05rem" }}>
        {item.question}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
        {item.motivation.slice(0, 130)}
        {item.motivation.length > 130 ? "…" : ""}
      </Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {item.relatedFields.slice(0, 3).map((f) => (
          <Chip key={f} label={f} size="small" variant="outlined" />
        ))}
      </Stack>
    </Card>
  );
}
