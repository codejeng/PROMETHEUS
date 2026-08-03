import { Box, Typography, Stack } from "@mui/material";
import { Scholarship } from "@/types";
import { dayjs, formatDate } from "@/utils/date";

export function ScholarshipCalendar({ items, onItemClick }: { items: Scholarship[]; onItemClick: (s: Scholarship) => void }) {
  const byMonth = new Map<string, Scholarship[]>();
  [...items]
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))
    .forEach((s) => {
      const key = dayjs(s.deadline).format("MMMM YYYY");
      byMonth.set(key, [...(byMonth.get(key) ?? []), s]);
    });

  return (
    <Stack spacing={3}>
      {Array.from(byMonth.entries()).map(([month, scholarships]) => (
        <Box key={month}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 1.5 }}>
            {month}
          </Typography>
          <Stack spacing={1}>
            {scholarships.map((s) => (
              <Box
                key={s.id}
                onClick={() => onItemClick(s)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{s.university}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>{formatDate(s.deadline, "MMM D")}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
