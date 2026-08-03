"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  Box,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Typography,
  Fade,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSearchIndex } from "@/lib/searchIndex";
import { SearchableKind } from "@/types";

const kindLabels: Record<SearchableKind, string> = {
  problem: "Problem",
  question: "Question",
  paper: "Paper",
  project: "Project",
  lab: "Lab",
  scholarship: "Scholarship",
  journal: "Journal",
  milestone: "Milestone",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const index = useSearchIndex();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 8);
    const q = query.toLowerCase();
    return index
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle?.toLowerCase().includes(q) ||
          kindLabels[r.kind].toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, index]);

  function go(href: string) {
    router.push(href);
    setOpen(false);
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} closeAfterTransition sx={{ backdropFilter: "blur(2px)" }}>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "16%",
            left: "50%",
            transform: "translateX(-50%)",
            width: { xs: "92%", sm: 560 },
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && results[activeIndex]) {
              go(results[activeIndex].href);
            }
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <InputBase
              inputRef={inputRef}
              fullWidth
              placeholder="Search projects, papers, labs, ideas…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              sx={{ fontSize: "1rem" }}
            />
            <Chip label="ESC" size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 20 }} />
          </Box>
          <List sx={{ maxHeight: 380, overflowY: "auto", py: 1 }}>
            {results.length === 0 && (
              <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Nothing found. Try a different term.
                </Typography>
              </Box>
            )}
            {results.map((r, i) => (
              <ListItemButton
                key={`${r.kind}-${r.id}`}
                selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => go(r.href)}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                <ListItemText
                  primary={r.title}
                  secondary={r.subtitle}
                  slotProps={{
                    primary: { noWrap: true, fontSize: "0.9rem" },
                    secondary: { noWrap: true, fontSize: "0.75rem" },
                  }}
                />
                <Chip label={kindLabels[r.kind]} size="small" sx={{ ml: 1, fontSize: "0.65rem", height: 22 }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Fade>
    </Modal>
  );
}
