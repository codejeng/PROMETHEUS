"use client";

import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { useAIStore } from "@/store/useAIStore";
import { useT } from "@/hooks/useT";
import { VoiceChatDialog } from "./VoiceChatDialog";

interface DiscussButtonProps {
  title: string;
  context: string;
  contextKey: string;
  size?: "small" | "medium";
}

/** Icon button that opens a voice/text chat about the given topic or article. Reused wherever the app surfaces something worth discussing: gap-analysis reports, briefing items, search results. */
export function DiscussButton({ title, context, contextKey, size = "small" }: DiscussButtonProps) {
  const t = useT("voiceChat");
  const apiKey = useAIStore((s) => s.apiKey);
  const aiStatus = useAIStore((s) => s.status);
  const hasApiKey = aiStatus === "connected" && apiKey.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={hasApiKey ? t("discussTooltip") : t("aiGatedTooltip")}>
        <span>
          <IconButton size={size} disabled={!hasApiKey} onClick={() => setOpen(true)}>
            <GraphicEqIcon sx={{ fontSize: size === "small" ? 16 : 20 }} />
          </IconButton>
        </span>
      </Tooltip>
      {hasApiKey && (
        <VoiceChatDialog
          open={open}
          onClose={() => setOpen(false)}
          title={title}
          context={context}
          contextKey={contextKey}
        />
      )}
    </>
  );
}
