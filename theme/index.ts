import { createTheme, ThemeOptions } from "@mui/material/styles";
import { darkTokens, lightTokens, radius } from "./palette";

function buildTheme(mode: "dark" | "light"): ThemeOptions {
  const t = mode === "dark" ? darkTokens : lightTokens;

  return {
    palette: {
      mode,
      background: {
        default: t.background,
        paper: t.surface,
      },
      primary: {
        main: t.accent,
        contrastText: mode === "dark" ? "#111111" : "#FFFFFF",
      },
      secondary: {
        main: t.info,
      },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.danger },
      info: { main: t.info },
      text: {
        primary: t.textPrimary,
        secondary: t.textSecondary,
        disabled: t.textTertiary,
      },
      divider: t.border,
    },
    shape: {
      borderRadius: radius,
    },
    spacing: 8,
    typography: {
      fontFamily: "var(--font-inter), system-ui, sans-serif",
      h1: {
        fontFamily: "var(--font-playfair), serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontFamily: "var(--font-playfair), serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      },
      h3: {
        fontFamily: "var(--font-playfair), serif",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h4: {
        fontFamily: "var(--font-playfair), serif",
        fontWeight: 500,
      },
      h5: {
        fontFamily: "var(--font-playfair), serif",
        fontWeight: 500,
      },
      h6: {
        fontFamily: "var(--font-inter), sans-serif",
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
      body1: { fontSize: "0.95rem", lineHeight: 1.65 },
      body2: { fontSize: "0.85rem", lineHeight: 1.6 },
      caption: { fontSize: "0.75rem", color: t.textTertiary },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: `${t.borderStrong} transparent`,
          },
          "*::-webkit-scrollbar": { width: 8, height: 8 },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: t.borderStrong,
            borderRadius: 8,
          },
          body: {
            backgroundColor: t.background,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${t.border}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: t.card,
            border: `1px solid ${t.border}`,
            borderRadius: radius,
            boxShadow: "none",
            transition:
              "border-color 200ms ease, transform 200ms ease, background-color 200ms ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius / 1.4,
            paddingInline: 18,
          },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius / 1.6,
          },
          notchedOutline: {
            borderColor: t.border,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: t.card,
            border: `1px solid ${t.border}`,
            color: t.textPrimary,
            fontSize: "0.75rem",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.border },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: t.border },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: t.surface,
            borderRight: `1px solid ${t.border}`,
          },
        },
      },
    },
  };
}

export const darkTheme = createTheme(buildTheme("dark"));
export const lightTheme = createTheme(buildTheme("light"));
