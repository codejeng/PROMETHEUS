"use client";

import { Box } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { PageTransition } from "./PageTransition";
import { Footer } from "./Footer";
import { CommandPalette } from "@/features/search/CommandPalette";
import { DataBootstrap } from "./DataBootstrap";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <DataBootstrap />
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
        <Footer />
      </Box>
      <CommandPalette />
    </Box>
  );
}
