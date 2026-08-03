import { Box, Typography, Stack, Chip } from "@mui/material";
import { Paper } from "@/types";
import { formatDate } from "@/utils/date";

export function PaperTimeline({ papers, onItemClick }: { papers: Paper[]; onItemClick: (p: Paper) => void }) {
  const sorted = [...papers].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <Stack sx={{ position: "relative", pl: 3 }}>
      <Box sx={{ position: "absolute", left: 7, top: 8, bottom: 8, width: "1px", bgcolor: "divider" }} />
      {sorted.map((p) => (
        <Box key={p.id} sx={{ position: "relative", pb: 3.5 }}>
          <Box
            sx={{
              position: "absolute",
              left: -21,
              top: 4,
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "primary.main",
              border: "2px solid",
              borderColor: "background.default",
            }}
          />
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {formatDate(p.createdAt)}
          </Typography>
          <Box
            onClick={() => onItemClick(p)}
            sx={{
              mt: 0.5,
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {p.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
              <Chip label={p.status} size="small" />
              <Chip label={p.category || "Uncategorized"} size="small" variant="outlined" />
            </Stack>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
