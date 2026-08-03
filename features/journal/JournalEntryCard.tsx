import { Card, Typography, Stack, Chip } from "@mui/material";
import { JournalEntry, Mood } from "@/types";
import { formatDate } from "@/utils/date";

const moodEmoji: Record<Mood, string> = {
  great: "🤩",
  good: "🙂",
  neutral: "😐",
  low: "😕",
  rough: "😣",
};

export function JournalEntryCard({ entry, onClick }: { entry: JournalEntry; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        cursor: "pointer",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatDate(entry.date)}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: "1.2rem" }}>{moodEmoji[entry.mood]}</Typography>
          <Chip label={`⚡ ${entry.energy}/5`} size="small" variant="outlined" />
          <Chip label={`${entry.deepWorkHours}h deep work`} size="small" variant="outlined" />
        </Stack>
      </Stack>
      {entry.todaysLearning && (
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
          {entry.todaysLearning}
        </Typography>
      )}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {entry.tags.map((t) => (
          <Chip key={t} label={t} size="small" />
        ))}
      </Stack>
    </Card>
  );
}
