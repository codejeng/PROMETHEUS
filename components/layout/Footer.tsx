import Image from "next/image";
import { Box, Stack, Typography } from "@mui/material";
import { useT } from "@/hooks/useT";

export function Footer() {
  const t = useT("nav");
  const year = new Date().getFullYear();

  return (
    <Stack
      component="footer"
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        mt: 8,
        pt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
        color: "text.disabled",
      }}
    >
      <Box sx={{ width: 20, height: 20, borderRadius: 0.5, overflow: "hidden", flexShrink: 0 }}>
        <Image src="/PROMETHEUS-logo.png" alt="" width={20} height={20} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Box>
      <Typography variant="caption">
        PROMETHEUS · {t("brandTagline")} · © {year}
      </Typography>
    </Stack>
  );
}
