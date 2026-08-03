import { create } from "zustand";

// Lightweight "sync status" indicator for the sidebar footer.
// Today everything is persisted to localStorage synchronously, so this is
// mostly cosmetic — but it's wired the way a real network sync indicator
// would be, so swapping localStorage for Supabase later is a drop-in.

interface SyncState {
  status: "saved" | "saving" | "error";
  lastSavedAt: string | null;
  pulse: () => void;
}

let pulseTimeout: ReturnType<typeof setTimeout> | null = null;

export const useSyncStore = create<SyncState>()((set) => ({
  status: "saved",
  lastSavedAt: null,
  pulse: () => {
    set({ status: "saving" });
    if (pulseTimeout) clearTimeout(pulseTimeout);
    pulseTimeout = setTimeout(() => {
      set({ status: "saved", lastSavedAt: new Date().toISOString() });
    }, 400);
  },
}));
