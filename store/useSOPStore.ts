import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SOPDocument, SOPSections } from "@/types";
import { nowISO } from "@/utils/date";
import { createId } from "@/utils/id";
import { useSyncStore } from "./useSyncStore";

interface SOPState {
  doc: SOPDocument;
  updateSection: (key: keyof SOPSections, value: string) => void;
  saveVersion: (label: string) => void;
  restoreVersion: (versionId: string) => void;
}

const emptySections: SOPSections = {
  personalStory: "",
  motivation: "",
  researchExperience: "",
  futureGoals: "",
  whyThisLab: "",
  whyThisUniversity: "",
  whyMe: "",
};

export const useSOPStore = create<SOPState>()(
  persist(
    (set, get) => ({
      doc: { sections: emptySections, versions: [], updatedAt: nowISO() },
      updateSection: (key, value) => {
        set({
          doc: {
            ...get().doc,
            sections: { ...get().doc.sections, [key]: value },
            updatedAt: nowISO(),
          },
        });
        useSyncStore.getState().pulse();
      },
      saveVersion: (label) => {
        const { doc } = get();
        const version = {
          id: createId(),
          content: doc.sections,
          savedAt: nowISO(),
          label,
        };
        set({ doc: { ...doc, versions: [version, ...doc.versions] } });
        useSyncStore.getState().pulse();
      },
      restoreVersion: (versionId) => {
        const version = get().doc.versions.find((v) => v.id === versionId);
        if (!version) return;
        set({
          doc: { ...get().doc, sections: version.content, updatedAt: nowISO() },
        });
        useSyncStore.getState().pulse();
      },
    }),
    { name: "prometheus-sop" }
  )
);
