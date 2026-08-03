import { Card, Typography, Chip, Stack, LinearProgress } from "@mui/material";
import { Scholarship } from "@/types";
import { daysUntil, formatDate } from "@/utils/date";

const statusColor: Record<Scholarship["status"], string> = {
  Researching: "#8FB2C9",
  Preparing: "#E0B15C",
  Applied: "#B39DDB",
  Interview: "#F48FB1",
  Accepted: "#7FB77E",
  Rejected: "#D97C6B",
};

export function ScholarshipCard({ item, onClick }: { item: Scholarship; onClick: () => void }) {
  const days = daysUntil(item.deadline);
  const doneCount = item.checklist.filter((c) => c.done).length;
  const progress = item.checklist.length ? Math.round((doneCount / item.checklist.length) * 100) : 0;

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
      <Chip
        label={item.status}
        size="small"
        sx={{ alignSelf: "flex-start", bgcolor: `${statusColor[item.status]}22`, color: statusColor[item.status], fontWeight: 600 }}
      />
      <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 600, fontSize: "1.05rem" }}>
        {item.name}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {item.university} · {item.country}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: days !== null && days >= 0 && days < 30 ? "error.main" : "text.disabled" }}
      >
        Deadline {formatDate(item.deadline)} {days !== null ? `(${days >= 0 ? `${days}d left` : "past"})` : ""}
      </Typography>
      {item.checklist.length > 0 && (
        <Stack spacing={0.5}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {doneCount}/{item.checklist.length} checklist done
          </Typography>
        </Stack>
      )}
    </Card>
  );
}
