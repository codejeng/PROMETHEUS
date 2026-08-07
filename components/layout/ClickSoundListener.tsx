"use client";

import { useEffect } from "react";
import { useSoundStore } from "@/store/useSoundStore";
import { playClickSound } from "@/lib/sound/clickSound";

/**
 * Plays a synthesized click sound for every MUI ButtonBase-derived control
 * (Button, IconButton, Chip, Tab, MenuItem, ...) app-wide. There's no shared
 * button wrapper component in this codebase, so a capture-phase listener
 * filtered by MUI's `.MuiButtonBase-root` class is the single interception
 * point that covers all of them without touching 40+ call sites.
 */
export function ClickSoundListener() {
  const muted = useSoundStore((s) => s.muted);

  useEffect(() => {
    if (muted) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(".MuiButtonBase-root")) {
        playClickSound();
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [muted]);

  return null;
}
