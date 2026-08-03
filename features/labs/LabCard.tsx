import { Card, Typography, Chip } from "@mui/material";
import { Lab } from "@/types";
import { daysUntil, formatDate } from "@/utils/date";

const statusColor: Record<Lab["status"], string> = {
  Dream: "#B39DDB",
  Applying: "#E0B15C",
  Contacted: "#8FB2C9",
  Rejected: "#D97C6B",
  Accepted: "#7FB77E",
};

export function LabCard({ lab, onClick }: { lab: Lab; onClick: () => void }) {
  const days = daysUntil(lab.applicationDeadline);
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
        label={lab.status}
        size="small"
        sx={{ alignSelf: "flex-start", bgcolor: `${statusColor[lab.status]}22`, color: statusColor[lab.status], fontWeight: 600 }}
      />
      <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 600, fontSize: "1.05rem" }}>
        {lab.professor}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{lab.university}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
        {lab.researchArea.slice(0, 100)}
        {lab.researchArea.length > 100 ? "…" : ""}
      </Typography>
      {lab.applicationDeadline && (
        <Typography variant="caption" sx={{ color: days !== null && days < 30 ? "error.main" : "text.disabled" }}>
          Deadline {formatDate(lab.applicationDeadline)} {days !== null && days >= 0 ? `(${days}d)` : ""}
        </Typography>
      )}
    </Card>
  );
}
