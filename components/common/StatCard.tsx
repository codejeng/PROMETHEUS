import { Card, Box, Typography, Stack } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: SvgIconComponent;
  accent?: "default" | "success" | "warning" | "danger";
  children?: React.ReactNode;
}

const accentColor: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "primary.main",
  success: "success.main",
  warning: "warning.main",
  danger: "error.main",
};

export function StatCard({ label, value, hint, icon: Icon, accent = "default", children }: StatCardProps) {
  return (
    <Card sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          {label}
        </Typography>
        {Icon && <Icon sx={{ fontSize: 18, color: accentColor[accent] }} />}
      </Stack>
      <Typography variant="h4" sx={{ fontFamily: "var(--font-playfair), serif", fontSize: "1.9rem", mb: 0.5 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {hint}
        </Typography>
      )}
      {children && <Box sx={{ mt: "auto", pt: 1.5 }}>{children}</Box>}
    </Card>
  );
}
