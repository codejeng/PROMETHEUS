import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Vision } from "@/types";
import { nowISO } from "@/utils/date";
import { useSyncStore } from "./useSyncStore";

interface VisionState {
  vision: Vision;
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

export const useVisionStore = create<VisionState>()(
  persist(
    (set, get) => ({
      vision: emptyVision,
      update: (patch) => {
        set({ vision: { ...get().vision, ...patch, updatedAt: nowISO() } });
        useSyncStore.getState().pulse();
      },
    }),
    { name: "prometheus-vision" }
  )
);
