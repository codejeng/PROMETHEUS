import Image from "next/image";
import { Box, Stack, Typography, Divider } from "@mui/material";
import { useT } from "@/hooks/useT";

export function Footer() {
  const t = useT("nav");
  const year = new Date().getFullYear();

  return (
    <Stack
      component="footer"
      spacing={2.5}
      sx={{
        mt: 8,
        pt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 48*1.2,
            height: 48*1.2,
            borderRadius: 0.5,
            overflow: "hidden",
            flexShrink: 0,
            borderColor: "divider",
          }}
        >
          <Image
            src="/PROMETHEUS-logo.png"
            alt=""
            width={96}
            height={96}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 600, letterSpacing: "0.04em" }}
          >
            PROMETHEUS
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {t("brandTagline")}
          </Typography>
        </Box>
      </Stack>

      <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 560 }}>
        {t("footerDescription")}
      </Typography>

      <Divider />

      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        © {year} PROMETHEUS
      </Typography>
    </Stack>
  );
}
