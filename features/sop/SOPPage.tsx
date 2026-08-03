"use client";

import { useState } from "react";
import { Box, Button, Grid, Stack, Typography, Card, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { useSOPStore } from "@/store/useSOPStore";
import { SOPSectionEditor } from "./SOPSectionEditor";
import { SOPSections } from "@/types";
import { relative } from "@/utils/date";
import { useT } from "@/hooks/useT";
import toast from "react-hot-toast";

const sectionKeys: { key: keyof SOPSections; labelKey: string; helperKey: string }[] = [
  { key: "personalStory", labelKey: "personalStory", helperKey: "personalStoryHelp" },
  { key: "motivation", labelKey: "motivation", helperKey: "motivationHelp" },
  { key: "researchExperience", labelKey: "researchExperience", helperKey: "researchExperienceHelp" },
  { key: "futureGoals", labelKey: "futureGoals", helperKey: "futureGoalsHelp" },
  { key: "whyThisLab", labelKey: "whyThisLab", helperKey: "whyThisLabHelp" },
  { key: "whyThisUniversity", labelKey: "whyThisUniversity", helperKey: "whyThisUniversityHelp" },
  { key: "whyMe", labelKey: "whyMe", helperKey: "whyMeHelp" },
];

export function SOPPage() {
  const t = useT("sop");
  const doc = useSOPStore((s) => s.doc);
  const updateSection = useSOPStore((s) => s.updateSection);
  const saveVersion = useSOPStore((s) => s.saveVersion);
  const restoreVersion = useSOPStore((s) => s.restoreVersion);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");

  const totalWords = Object.values(doc.sections).reduce(
    (sum, text) => sum + (text.trim() ? text.trim().split(/\s+/).length : 0),
    0
  );

  function handleSaveVersion() {
    saveVersion(versionLabel.trim() || `Version ${doc.versions.length + 1}`);
    setVersionLabel("");
    toast.success(t("versionSavedToast"));
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={`${t("wordsTotal", { count: totalWords })} · ${relative(doc.updatedAt)}`}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<HistoryOutlinedIcon />} onClick={() => setHistoryOpen(true)}>
              {t("history")}
            </Button>
            <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} onClick={() => window.print()}>
              {t("exportPdf")}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box>
            {sectionKeys.map((s) => (
              <SOPSectionEditor
                key={s.key}
                label={t(s.labelKey)}
                helperText={t(s.helperKey)}
                value={doc.sections[s.key]}
                onSave={(v) => updateSection(s.key, v)}
              />
            ))}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, position: "sticky", top: 24 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>{t("saveVersion")}</Typography>
            <Stack spacing={1.5}>
              <TextField
                size="small"
                placeholder={t("versionLabelPlaceholder")}
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={handleSaveVersion}>
                {t("saveSnapshot")}
              </Button>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 2 }}>
              {t("versionsSaved", { count: doc.versions.length })}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Box id="sop-print-area" sx={{ display: "none" }}>
        {sectionKeys.map((s) => (
          <Box key={s.key} sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontFamily: "var(--font-playfair), serif" }}>{t(s.labelKey)}</Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>{doc.sections[s.key]}</Typography>
          </Box>
        ))}
      </Box>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>{t("versionHistory")}</DialogTitle>
        <DialogContent>
          {doc.versions.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("noVersions")}</Typography>
          ) : (
            <Stack spacing={1.5}>
              {doc.versions.map((v) => (
                <Stack key={v.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.label}</Typography>
                    <Chip label={relative(v.savedAt)} size="small" variant="outlined" sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }} />
                  </Box>
                  <Button
                    size="small"
                    startIcon={<RestoreOutlinedIcon fontSize="small" />}
                    onClick={() => {
                      restoreVersion(v.id);
                      toast.success(t("restored", { label: v.label }));
                      setHistoryOpen(false);
                    }}
                  >
                    {t("restore")}
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setHistoryOpen(false)} color="inherit">{t("close")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
