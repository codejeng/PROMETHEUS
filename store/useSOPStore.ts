import { create } from "zustand";
import { SOPDocument, SOPSections } from "@/types";
import { nowISO } from "@/utils/date";
import { createId } from "@/utils/id";
import { useSyncStore } from "./useSyncStore";
import { supabase } from "@/lib/supabase/client";
import { toRow, fromRow } from "@/utils/caseConvert";
import toast from "react-hot-toast";

interface SOPState {
  doc: SOPDocument;
  hydrated: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
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

// `sop_document` is a singleton row (id = true) holding the current
// sections; `sop_versions` is a normal append-only collection table. See
// supabase/schema.sql.
export const useSOPStore = create<SOPState>()((set, get) => ({
  doc: { sections: emptySections, versions: [], updatedAt: nowISO() },
  hydrated: false,
  loading: false,

  fetch: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    const [{ data: docRow, error: docError }, { data: versionRows, error: versionError }] =
      await Promise.all([
        supabase.from("sop_document").select("*").eq("id", true).single(),
        supabase.from("sop_versions").select("*").order("saved_at", { ascending: false }),
      ]);

    if (docError || versionError) {
      set({ loading: false });
      toast.error(`Couldn't load SOP: ${(docError ?? versionError)?.message}`);
      return;
    }

    const { id: _ignored, updated_at, ...sectionFields } = docRow;
    void _ignored;
    const sections = fromRow<SOPSections>(sectionFields);
    const versions = (versionRows ?? []).map((row) => ({
      id: row.id as string,
      content: row.content as SOPSections,
      savedAt: row.saved_at as string,
      label: row.label as string,
    }));

    set({ doc: { sections, versions, updatedAt: updated_at }, hydrated: true, loading: false });
  },

  updateSection: (key, value) => {
    const previous = get().doc;
    const nextSections = { ...previous.sections, [key]: value };
    const updatedAt = nowISO();
    set({ doc: { ...previous, sections: nextSections, updatedAt } });
    useSyncStore.getState().pulse();

    supabase
      .from("sop_document")
      .update({ ...toRow(nextSections), updated_at: updatedAt })
      .eq("id", true)
      .then(({ error }) => {
        if (error) {
          set({ doc: previous });
          toast.error(`Couldn't save SOP: ${error.message}`);
        }
      });
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

    supabase
      .from("sop_versions")
      .insert({ id: version.id, content: version.content, saved_at: version.savedAt, label: version.label })
      .then(({ error }) => {
        if (error) {
          set({ doc: { ...get().doc, versions: get().doc.versions.filter((v) => v.id !== version.id) } });
          toast.error(`Couldn't save version: ${error.message}`);
        }
      });
  },

  restoreVersion: (versionId) => {
    const previous = get().doc;
    const version = previous.versions.find((v) => v.id === versionId);
    if (!version) return;
    const updatedAt = nowISO();
    set({ doc: { ...previous, sections: version.content, updatedAt } });
    useSyncStore.getState().pulse();

    supabase
      .from("sop_document")
      .update({ ...toRow(version.content), updated_at: updatedAt })
      .eq("id", true)
      .then(({ error }) => {
        if (error) {
          set({ doc: previous });
          toast.error(`Couldn't restore version: ${error.message}`);
        }
      });
  },
}));
