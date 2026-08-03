import { Card, Typography, Chip, Stack } from "@mui/material";
import { Paper, ReadingStatus } from "@/types";

const statusColor: Record<ReadingStatus, string> = {
  "To Read": "#8FB2C9",
  Reading: "#E0B15C",
  Read: "#7FB77E",
  Reference: "#B39DDB",
};

export function PaperCard({ paper, onClick }: { paper: Paper; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
      }}
    >
      <Stack direction="row" spacing={1}>
        <Chip
          label={paper.status}
          size="small"
          sx={{ bgcolor: `${statusColor[paper.status]}22`, color: statusColor[paper.status], fontWeight: 600 }}
        />
        <Chip label={paper.category || "Uncategorized"} size="small" variant="outlined" />
      </Stack>
      <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 600, fontSize: "1.05rem" }}>
        {paper.title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {paper.authors.join(", ") || "Unknown authors"}
      </Typography>
      {paper.keyInsight && (
        <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
          {paper.keyInsight.slice(0, 110)}
          {paper.keyInsight.length > 110 ? "…" : ""}
        </Typography>
      )}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {paper.knowledgeTags.slice(0, 3).map((t) => (
          <Chip key={t} label={t} size="small" variant="outlined" />
        ))}
      </Stack>
    </Card>
  );
}
