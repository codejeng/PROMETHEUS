"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { PageHeader } from "@/components/common/PageHeader";
import { useThemeStore } from "@/store/useThemeStore";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useAIStore } from "@/store/useAIStore";
import { downloadExport, importData } from "@/lib/exportImport";
import { suggestedModels } from "@/lib/ai/modelCatalog";
import { useT } from "@/hooks/useT";
import toast from "react-hot-toast";

export function SettingsPage() {
  const t = useT("settings");
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const headingFont = useThemeStore((s) => s.headingFont);
  const setHeadingFont = useThemeStore((s) => s.setHeadingFont);
  const autosave = useThemeStore((s) => s.autosave);
  const setAutosave = useThemeStore((s) => s.setAutosave);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiKey = useAIStore((s) => s.apiKey);
  const setApiKey = useAIStore((s) => s.setApiKey);
  const baseURL = useAIStore((s) => s.baseURL);
  const setBaseURL = useAIStore((s) => s.setBaseURL);
  const model = useAIStore((s) => s.model);
  const setModel = useAIStore((s) => s.setModel);
  const clearConnection = useAIStore((s) => s.clearConnection);
  const status = useAIStore((s) => s.status);
  const errorMessage = useAIStore((s) => s.errorMessage);
  const setStatus = useAIStore((s) => s.setStatus);
  const [draftKey, setDraftKey] = useState(apiKey);
  const [draftBaseURL, setDraftBaseURL] = useState(baseURL);
  const [draftModel, setDraftModel] = useState(model);
  const [showKey, setShowKey] = useState(false);
  const isConnected = status === "connected" && apiKey.length > 0;

  // Zustand's persist middleware rehydrates from localStorage after this
  // component's first render, so the draft fields need to pick up the
  // real values once hydration lands (otherwise a page reload while
  // connected shows empty disabled fields instead of the saved values).
  useEffect(() => setDraftKey(apiKey), [apiKey]);
  useEffect(() => setDraftBaseURL(baseURL), [baseURL]);
  useEffect(() => setDraftModel(model), [model]);

  const shortcuts = [
    { keys: "⌘ K", action: t("shortcutSearch") },
    { keys: "Esc", action: t("shortcutEsc") },
    { keys: "Enter", action: t("shortcutEnter") },
    { keys: "↑ / ↓", action: t("shortcutArrows") },
  ];

  const aiFeatures = [
    { key: "summarization", title: t("aiSummarization"), desc: t("aiSummarizationDesc") },
    { key: "assistant", title: t("aiResearchAssistant"), desc: t("aiResearchAssistantDesc") },
    { key: "ideas", title: t("aiIdeaGeneration"), desc: t("aiIdeaGenerationDesc") },
    { key: "labs", title: t("aiLabRecommendation"), desc: t("aiLabRecommendationDesc") },
    { key: "scholarships", title: t("aiScholarshipRecommendation"), desc: t("aiScholarshipRecommendationDesc") },
    { key: "sop", title: t("aiSopReview"), desc: t("aiSopReviewDesc") },
    { key: "search", title: t("aiKnowledgeSearch"), desc: t("aiKnowledgeSearchDesc") },
  ];

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result as string);
        toast.success(t("importSuccess"));
        setTimeout(() => window.location.reload(), 800);
      } catch {
        toast.error(t("importError"));
      }
    };
    reader.readAsText(file);
  }

  async function handleConnect() {
    const key = draftKey.trim();
    const url = draftBaseURL.trim();
    const modelId = draftModel.trim();
    if (!key || !url || !modelId) return;
    setApiKey(key);
    setBaseURL(url);
    setModel(modelId);
    setStatus("checking");
    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, baseURL: url, model: modelId }),
      });
      const data = await res.json();
      if (res.ok && data.connected) {
        setStatus("connected");
        toast.success(t("connectedToast"));
      } else {
        setStatus("error", data.error ?? "Connection failed");
        toast.error(data.error ?? "Connection failed");
      }
    } catch {
      setStatus("error", "Could not reach the server.");
      toast.error("Could not reach the server.");
    }
  }

  function handleDisconnect() {
    clearConnection();
    setDraftKey("");
  }

  return (
    <Box sx={{ maxWidth: 760 }}>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>{t("appearance")}</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{t("theme")}</Typography>
              <Box sx={{ mt: 1 }}>
                <ToggleButtonGroup value={mode} exclusive onChange={() => toggleMode()} size="small">
                  <ToggleButton value="dark">{t("dark")}</ToggleButton>
                  <ToggleButton value="light">{t("light")}</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{t("headingTypeface")}</Typography>
              <Box sx={{ mt: 1 }}>
                <ToggleButtonGroup
                  value={headingFont}
                  exclusive
                  onChange={(_, v) => v && setHeadingFont(v)}
                  size="small"
                >
                  <ToggleButton value="Playfair Display">Playfair Display</ToggleButton>
                  <ToggleButton value="Inter">Inter</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <LanguageOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t("languageTitle")}</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {t("languageDesc")}
          </Typography>
          <ToggleButtonGroup value={locale} exclusive onChange={(_, v) => v && setLocale(v)} size="small">
            <ToggleButton value="en">English</ToggleButton>
            <ToggleButton value="th">ไทย (Thai)</ToggleButton>
          </ToggleButtonGroup>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>{t("autosaveTitle")}</Typography>
          <FormControlLabel
            control={<Switch checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />}
            label={t("autosaveDesc")}
          />
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>{t("dataTitle")}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {t("dataDesc")}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => { downloadExport(); toast.success(t("exportDownloaded")); }}>
              {t("exportJson")}
            </Button>
            <Button variant="outlined" startIcon={<FileUploadOutlinedIcon />} onClick={() => fileInputRef.current?.click()}>
              {t("importJson")}
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>{t("shortcuts")}</Typography>
          <Stack spacing={1.25}>
            {shortcuts.map((s) => (
              <Stack key={s.keys} direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: "text.secondary" }}>{s.action}</Typography>
                <Chip label={s.keys} size="small" sx={{ fontFamily: "var(--font-jetbrains-mono)" }} />
              </Stack>
            ))}
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <VpnKeyOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{t("aiConnectionTitle")}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <FiberManualRecordIcon
                sx={{
                  fontSize: 9,
                  color: isConnected ? "success.main" : status === "checking" ? "warning.main" : "text.disabled",
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {status === "checking" ? t("statusChecking") : isConnected ? t("statusConnected") : t("statusNotConnected")}
              </Typography>
            </Stack>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {t("aiConnectionDesc")}
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label={t("baseUrlLabel")}
              placeholder={t("baseUrlPlaceholder")}
              value={draftBaseURL}
              onChange={(e) => setDraftBaseURL(e.target.value)}
              disabled={isConnected}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Autocomplete
                freeSolo
                fullWidth
                disabled={isConnected}
                options={suggestedModels.map((m) => m.id)}
                groupBy={(id) => suggestedModels.find((m) => m.id === id)?.provider ?? ""}
                value={draftModel}
                onInputChange={(_, v) => setDraftModel(v)}
                renderInput={(params) => (
                  <TextField {...params} size="small" label={t("modelLabel")} placeholder={t("modelPlaceholder")} />
                )}
              />
              <TextField
                fullWidth
                size="small"
                label={t("apiKeyLabel")}
                placeholder={t("apiKeyPlaceholder")}
                type={showKey ? "text" : "password"}
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                disabled={isConnected}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowKey((v) => !v)} edge="end">
                          {showKey ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
            {isConnected ? (
              <Button variant="outlined" color="error" onClick={handleDisconnect} sx={{ alignSelf: "flex-start" }}>
                {t("disconnect")}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleConnect}
                disabled={!draftKey.trim() || !draftBaseURL.trim() || !draftModel.trim() || status === "checking"}
                sx={{ alignSelf: "flex-start" }}
              >
                {status === "checking" ? t("statusChecking") : t("testConnection")}
              </Button>
            )}
          </Stack>
          {status === "error" && errorMessage && (
            <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 1 }}>
              {errorMessage}
            </Typography>
          )}
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t("aiComingSoon")}</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {t("aiDesc")}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.75}>
            {aiFeatures.map((f) => {
              const active = f.key === "summarization" && isConnected;
              return (
                <Stack key={f.key} direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {f.title}
                      </Typography>
                      {active && (
                        <Chip label={t("statusConnected")} size="small" color="success" sx={{ height: 18, fontSize: "0.62rem" }} />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{f.desc}</Typography>
                  </Box>
                  <Switch checked={active} disabled={!active} size="small" />
                </Stack>
              );
            })}
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
