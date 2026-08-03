"use client";

import { Box, Stack, Divider } from "@mui/material";
import { PageHeader } from "@/components/common/PageHeader";
import { AutosaveField } from "@/components/common/AutosaveField";
import { useVisionStore } from "@/store/useVisionStore";
import { relative } from "@/utils/date";
import { useT } from "@/hooks/useT";

export function VisionPage() {
  const vision = useVisionStore((s) => s.vision);
  const update = useVisionStore((s) => s.update);
  const t = useT("vision");

  return (
    <Box sx={{ maxWidth: 800 }}>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={`${t("autosaving")} · ${t("lastUpdated", { time: relative(vision.updatedAt) })}`}
      />

      <Stack divider={<Divider sx={{ my: 1 }} />}>
        <AutosaveField
          label={t("mission")}
          helperText={t("missionHelp")}
          value={vision.mission}
          onSave={(v) => update({ mission: v })}
          minRows={2}
          placeholder="Help humanity master energy abundance through fusion."
        />
        <AutosaveField
          label={t("coreBeliefs")}
          helperText={t("coreBeliefsHelp")}
          value={vision.coreBeliefs}
          onSave={(v) => update({ coreBeliefs: v })}
          minRows={4}
          placeholder="I believe compounding knowledge over decades beats short-term optimization…"
        />
        <AutosaveField
          label={t("tenYear")}
          helperText={t("tenYearHelp")}
          value={vision.tenYearVision}
          onSave={(v) => update({ tenYearVision: v })}
          minRows={4}
        />
        <AutosaveField
          label={t("twentyYear")}
          helperText={t("twentyYearHelp")}
          value={vision.twentyYearVision}
          onSave={(v) => update({ twentyYearVision: v })}
          minRows={4}
        />
        <AutosaveField
          label={t("humanityImpact")}
          helperText={t("humanityImpactHelp")}
          value={vision.humanityImpact}
          onSave={(v) => update({ humanityImpact: v })}
          minRows={4}
        />
        <AutosaveField
          label={t("dreamLabs")}
          helperText={t("dreamLabsHelp")}
          value={vision.dreamLabs}
          onSave={(v) => update({ dreamLabs: v })}
          minRows={3}
        />
        <AutosaveField
          label={t("dreamMentors")}
          helperText={t("dreamMentorsHelp")}
          value={vision.dreamMentors}
          onSave={(v) => update({ dreamMentors: v })}
          minRows={3}
        />
      </Stack>
    </Box>
  );
}
