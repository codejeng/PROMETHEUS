import { Box, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { HermesPlanet } from "./HermesPlanet";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "flex-end" }}
      spacing={2}
      sx={{ mb: 5 }}
    >
      <Box sx={{ position: "relative" }}>
        {/* Hermes drifts in a small orbit near the title, never fully docking */}
        <motion.div
          style={{ position: "absolute", top: -26, left: -10, pointerEvents: "none" }}
          animate={{ x: [0, 12, 0, -12, 0], y: [0, -8, -14, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <HermesPlanet size={24} variant="float" />
        </motion.div>
        {eyebrow && (
          <Typography
            variant="overline"
            sx={{ color: "primary.main", letterSpacing: "0.12em", fontWeight: 600 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h3" sx={{ fontSize: { xs: "1.8rem", sm: "2.2rem" } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.75, maxWidth: 640 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}
