import { create } from "zustand";
import { BriefingInterests } from "@/types";
import { nowISO } from "@/utils/date";
import { useSyncStore } from "./useSyncStore";
import { supabase } from "@/lib/supabase/client";
import { fromRow } from "@/utils/caseConvert";
import toast from "react-hot-toast";

interface BriefingInterestsState {
  interests: BriefingInterests;
  hydrated: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  update: (patch: Partial<Pick<BriefingInterests, "primaryTopics" | "secondaryTopics">>) => void;
}

const emptyInterests: BriefingInterests = { primaryTopics: [], secondaryTopics: [], updatedAt: nowISO() };

// `briefing_interests` is a singleton row (id = true) — see
// supabase/schema.sql, which also seeds sensible defaults so this is never
// empty on first load.
export const useBriefingInterestsStore = create<BriefingInterestsState>()((set, get) => ({
  interests: emptyInterests,
  hydrated: false,
  loading: false,

  fetch: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    const { data, error } = await supabase.from("briefing_interests").select("*").eq("id", true).single();
    if (error) {
      set({ loading: false });
      toast.error(`Couldn't load interest topics: ${error.message}`);
      return;
    }
    const { id: _ignored, ...rest } = data;
    void _ignored;
    set({ interests: fromRow<BriefingInterests>(rest), hydrated: true, loading: false });
  },

  update: (patch) => {
    const previous = get().interests;
    const next = { ...previous, ...patch, updatedAt: nowISO() };
    set({ interests: next });
    useSyncStore.getState().pulse();

    const row: Record<string, unknown> = { updated_at: next.updatedAt };
    if (patch.primaryTopics) row.primary_topics = patch.primaryTopics;
    if (patch.secondaryTopics) row.secondary_topics = patch.secondaryTopics;

    supabase
      .from("briefing_interests")
      .update(row)
      .eq("id", true)
      .then(({ error }) => {
        if (error) {
          set({ interests: previous });
          toast.error(`Couldn't save interest topics: ${error.message}`);
        }
      });
  },
}));
