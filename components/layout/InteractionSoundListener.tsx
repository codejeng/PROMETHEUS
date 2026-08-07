"use client";

import { useEffect } from "react";
import { useSoundStore } from "@/store/useSoundStore";
import { playClickSound, playHoverSound } from "@/lib/sound/clickSound";
import { findInteractiveTarget } from "@/lib/dom/interactiveTarget";

/**
 * Plays a synthesized click sound on click, and a quieter blip on hover, for
 * every interactive element app-wide — MUI ButtonBase controls (Button/
 * IconButton/Chip/Tab/MenuItem), links, role="button", and plain Cards/rows
 * that declare `cursor: "pointer"`. There's no shared interactive-element
 * wrapper in this codebase, so a capture-phase listener is the single
 * interception point that covers all of them without touching every call site.
 */
export function InteractionSoundListener() {
  const muted = useSoundStore((s) => s.muted);

  useEffect(() => {
    if (muted) return;

    let lastHovered: Element | null = null;

    function handleClick(e: MouseEvent) {
      if (findInteractiveTarget(e.target as Element | null)) {
        playClickSound();
      }
    }

    function handlePointerOver(e: PointerEvent) {
      const interactive = findInteractiveTarget(e.target as Element | null);
      if (interactive && interactive !== lastHovered) {
        lastHovered = interactive;
        playHoverSound();
      } else if (!interactive) {
        lastHovered = null;
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("pointerover", handlePointerOver, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("pointerover", handlePointerOver, { capture: true });
    };
  }, [muted]);

  return null;
}
