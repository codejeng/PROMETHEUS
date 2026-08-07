import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundState {
  muted: boolean;
  toggleMuted: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      muted: false,
      toggleMuted: () => set({ muted: !get().muted }),
    }),
    { name: "prometheus-sound" }
  )
);
