import { Box, CircularProgress } from "@mui/material";

export function LoadingState() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress size={28} sx={{ color: "text.disabled" }} />
    </Box>
  );
}
