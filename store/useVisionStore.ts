import { create } from "zustand";
import { Vision } from "@/types";
import { nowISO } from "@/utils/date";
import { useSyncStore } from "./useSyncStore";
import { supabase } from "@/lib/supabase/client";
import { toRow, fromRow } from "@/utils/caseConvert";
import toast from "react-hot-toast";

interface VisionState {
  vision: Vision;
  hydrated: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  update: (patch: Partial<Vision>) => void;
}

const emptyVision: Vision = {
  mission: "",
  coreBeliefs: "",
  tenYearVision: "",
  twentyYearVision: "",
  humanityImpact: "",
  dreamLabs: "",
  dreamMentors: "",
  updatedAt: nowISO(),
};

// `vision` is a singleton row (id = true) — see supabase/schema.sql. The
// seed migration inserts that row once, so the app only ever UPDATEs it.
export const useVisionStore = create<VisionState>()((set, get) => ({
  vision: emptyVision,
  hydrated: false,
  loading: false,

  fetch: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    const { data, error } = await supabase.from("vision").select("*").eq("id", true).single();
    if (error) {
      set({ loading: false });
      toast.error(`Couldn't load Vision: ${error.message}`);
      return;
    }
    const { id: _ignored, ...rest } = data;
    void _ignored;
    set({ vision: fromRow<Vision>(rest), hydrated: true, loading: false });
  },

  update: (patch) => {
    const previous = get().vision;
    const next = { ...previous, ...patch, updatedAt: nowISO() };
    set({ vision: next });
    useSyncStore.getState().pulse();

    supabase
      .from("vision")
      .update(toRow(next))
      .eq("id", true)
      .then(({ error }) => {
        if (error) {
          set({ vision: previous });
          toast.error(`Couldn't save Vision: ${error.message}`);
        }
      });
  },
}));
