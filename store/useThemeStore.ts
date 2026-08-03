import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  headingFont: "Playfair Display" | "Inter";
  autosave: boolean;
  toggleMode: () => void;
  setHeadingFont: (font: "Playfair Display" | "Inter") => void;
  setAutosave: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
      headingFont: "Playfair Display",
      autosave: true,
      toggleMode: () => set({ mode: get().mode === "dark" ? "light" : "dark" }),
      setHeadingFont: (font) => set({ headingFont: font }),
      setAutosave: (v) => set({ autosave: v }),
    }),
    { name: "prometheus-theme" }
  )
);
