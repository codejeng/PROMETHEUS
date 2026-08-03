"use client";

import { Box } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { PageTransition } from "./PageTransition";
import { CommandPalette } from "@/features/search/CommandPalette";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 5 },
          maxWidth: 1440,
          mx: "auto",
          width: "100%",
        }}
      >
        <PageTransition>{children}</PageTransition>
      </Box>
      <CommandPalette />
    </Box>
  );
}
