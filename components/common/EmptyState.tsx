import { Box, Typography, Button } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        px: 3,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 4,
      }}
    >
      <Icon sx={{ fontSize: 34, color: "text.disabled", mb: 1.5 }} />
      <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75, maxWidth: 420, mx: "auto" }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 3 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
