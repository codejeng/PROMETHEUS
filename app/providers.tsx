"use client";

import { useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/store/useThemeStore";
import { darkTheme, lightTheme } from "@/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const [queryClient] = useState(() => new QueryClient());
  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnimatePresence mode="wait" initial={false}>
          {children}
        </AnimatePresence>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: mode === "dark" ? "#202020" : "#FFFFFF",
              color: mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(17,17,17,0.92)",
              border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(17,17,17,0.08)"}`,
              borderRadius: 12,
              fontSize: "0.85rem",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
