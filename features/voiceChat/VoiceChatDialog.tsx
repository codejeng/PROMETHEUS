"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  Avatar,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import SendIcon from "@mui/icons-material/Send";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { useAIStore } from "@/store/useAIStore";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useT } from "@/hooks/useT";
import toast from "react-hot-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface VoiceChatDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  context: string;
  /** Changing this remounts the dialog body, resetting the conversation for a new topic/article. */
  contextKey: string;
}

export function VoiceChatDialog({ open, onClose, title, context, contextKey }: VoiceChatDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open && (
        <VoiceChatBody key={contextKey} title={title} context={context} onClose={onClose} />
      )}
    </Dialog>
  );
}

type Phase = "idle" | "listening" | "thinking" | "speaking";

function VoiceChatBody({ title, context, onClose }: { title: string; context: string; onClose: () => void }) {
  const t = useT("voiceChat");
  const apiKey = useAIStore((s) => s.apiKey);
  const baseURL = useAIStore((s) => s.baseURL);
  const model = useAIStore((s) => s.model);
  const locale = useLocaleStore((s) => s.locale);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [interim, setInterim] = useState("");
  const [textInput, setTextInput] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    setSpeechSupported(true);
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = locale === "th" ? "th-TH" : "en-US";
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript;
        else interimTranscript += result[0].transcript;
      }
      setInterim(interimTranscript);
      if (finalTranscript.trim()) {
        setInterim("");
        sendMessage(finalTranscript.trim());
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        toast.error(t("micError"));
      }
      setPhase("idle");
    };
    recognition.onend = () => {
      setPhase((prev) => (prev === "listening" ? "idle" : prev));
    };
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, interim]);

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (phase === "listening") {
      recognitionRef.current.stop();
      setPhase("idle");
      return;
    }
    window.speechSynthesis?.cancel();
    setPhase("listening");
    try {
      recognitionRef.current.start();
    } catch {
      // start() throws if already started; ignore.
    }
  }

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === "th" ? "th-TH" : "en-US";
    // The default speechSynthesis rate (1.0) reads noticeably slower and
    // flatter than natural conversational speech — bump it for a livelier,
    // less robotic pace, closer to how a person actually talks.
    utterance.rate = 1.15;
    utterance.pitch = 1.02;
    const voice = pickVoice(utterance.lang);
    if (voice) utterance.voice = voice;
    utterance.onend = () => setPhase("idle");
    utterance.onerror = () => setPhase("idle");
    setPhase("speaking");
    window.speechSynthesis.speak(utterance);
  }

  function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis?.getVoices() ?? [];
    const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
    if (matching.length === 0) return undefined;
    // Prefer higher-quality "natural"/"neural"/"premium"-style voices Chrome
    // exposes on top of the default robotic system voice, where available.
    return (
      matching.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ??
      matching.find((v) => v.name.toLowerCase().includes("google")) ??
      matching[0]
    );
  }

  async function sendMessage(content: string) {
    if (!content.trim()) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: content.trim() }];
    setMessages(nextMessages);
    setPhase("thinking");
    try {
      const res = await fetch("/api/ai/voice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, baseURL, model, context, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("error"));
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      speak(data.reply);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
      setPhase("idle");
    }
  }

  function handleTextSubmit() {
    if (!textInput.trim() || phase === "thinking") return;
    const value = textInput.trim();
    setTextInput("");
    sendMessage(value);
  }

  function handleClose() {
    recognitionRef.current?.abort();
    window.speechSynthesis?.cancel();
    onClose();
  }

  const statusLabel =
    phase === "listening" ? t("statusListening") : phase === "thinking" ? t("statusThinking") : phase === "speaking" ? t("statusSpeaking") : "";

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pr: 6 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <GraphicEqIcon sx={{ fontSize: 18 }} />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "var(--font-playfair), serif" }} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: statusLabel ? "primary.main" : "text.disabled" }}>
            {statusLabel || t("subtitle")}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ position: "absolute", right: 12, top: 12 }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", p: 0 }}>
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", px: 3, py: 2, minHeight: 320, maxHeight: 420 }}>
          {messages.length === 0 && !interim && (
            <Typography variant="body2" sx={{ color: "text.disabled", textAlign: "center", mt: 6 }}>
              {speechSupported ? t("emptyWithMic") : t("emptyNoMic")}
            </Typography>
          )}
          <Stack spacing={1.5}>
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  bgcolor: m.role === "user" ? "primary.main" : "action.hover",
                  color: m.role === "user" ? "primary.contrastText" : "text.primary",
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="body2">{m.content}</Typography>
              </Box>
            ))}
            {interim && (
              <Box sx={{ alignSelf: "flex-end", maxWidth: "82%", opacity: 0.6, px: 2, py: 1 }}>
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>{interim}</Typography>
              </Box>
            )}
            {phase === "thinking" && (
              <Box sx={{ alignSelf: "flex-start", px: 2, py: 1 }}>
                <CircularProgress size={16} />
              </Box>
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          {speechSupported && (
            <Tooltip title={phase === "listening" ? t("stopListening") : t("startListening")}>
              <IconButton
                onClick={toggleListening}
                disabled={phase === "thinking"}
                sx={{
                  bgcolor: phase === "listening" ? "error.main" : "primary.main",
                  color: phase === "listening" ? "error.contrastText" : "primary.contrastText",
                  "&:hover": { bgcolor: phase === "listening" ? "error.dark" : "primary.dark" },
                }}
              >
                {phase === "listening" ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
          )}
          {phase === "speaking" && (
            <Tooltip title={t("stopSpeaking")}>
              <IconButton onClick={() => window.speechSynthesis?.cancel()}>
                <StopCircleOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
          <TextField
            fullWidth
            size="small"
            placeholder={t("textPlaceholder")}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            disabled={phase === "thinking"}
          />
          <IconButton onClick={handleTextSubmit} disabled={!textInput.trim() || phase === "thinking"}>
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </DialogContent>
    </>
  );
}
