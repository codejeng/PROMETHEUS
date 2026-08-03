"use client";

import { useEffect, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

interface AutosaveFieldProps {
  label: string;
  helperText?: string;
  value: string;
  onSave: (value: string) => void;
  minRows?: number;
  placeholder?: string;
}

export function AutosaveField({
  label,
  helperText,
  value,
  onSave,
  minRows = 4,
  placeholder,
}: AutosaveFieldProps) {
  const [draft, setDraft] = useState(value);
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => setDraft(value), [value]);

  const debouncedSave = useDebouncedCallback((next: string) => {
    onSave(next);
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1400);
  }, 600);

  return (
    <Box sx={{ mb: 4.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: "var(--font-inter)", fontSize: "0.95rem", fontWeight: 600 }}>
          {label}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            opacity: savedPulse ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "success.main" }} />
          <Typography variant="caption" sx={{ color: "success.main" }}>
            Saved
          </Typography>
        </Box>
      </Box>
      {helperText && (
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
          {helperText}
        </Typography>
      )}
      <TextField
        fullWidth
        multiline
        minRows={minRows}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          debouncedSave(e.target.value);
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontSize: "0.95rem",
            lineHeight: 1.7,
            bgcolor: "background.paper",
          },
        }}
      />
    </Box>
  );
}
