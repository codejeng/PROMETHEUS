"use client";

import { useEffect, useState } from "react";
import { Box, Typography, TextField, ToggleButtonGroup, ToggleButton, Stack } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export function SOPSectionEditor({
  label,
  helperText,
  value,
  onSave,
}: {
  label: string;
  helperText: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [mode, setMode] = useState<"write" | "preview">("write");

  useEffect(() => setDraft(value), [value]);

  const debouncedSave = useDebouncedCallback((next: string) => onSave(next), 600);

  return (
    <Box sx={{ mb: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>{label}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>{helperText}</Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="caption" sx={{ color: "text.disabled", fontFamily: "var(--font-jetbrains-mono)" }}>
            {wordCount(draft)} words
          </Typography>
          <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_, v) => v && setMode(v)}>
            <ToggleButton value="write" sx={{ fontSize: "0.7rem", px: 1.5 }}>Write</ToggleButton>
            <ToggleButton value="preview" sx={{ fontSize: "0.7rem", px: 1.5 }}>Preview</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      {mode === "write" ? (
        <TextField
          fullWidth
          multiline
          minRows={6}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            debouncedSave(e.target.value);
          }}
          placeholder="Write in Markdown — headings, lists, and emphasis are supported."
          sx={{ "& .MuiOutlinedInput-root": { fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.85rem", lineHeight: 1.7 } }}
        />
      ) : (
        <Box
          className="markdown-body"
          sx={{
            minHeight: 140,
            p: 2.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          {draft.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
          ) : (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>Nothing written yet.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
