// Shared design tokens. Dark mode is the primary, designed-for experience;
// light mode derives from the same scale so the product still feels
// like one system when toggled.

export const radius = 16;
export const spacingUnit = 8;

export const darkTokens = {
  background: "#111111",
  surface: "#181818",
  card: "#202020",
  cardHover: "#242424",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  textPrimary: "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.60)",
  textTertiary: "rgba(255,255,255,0.38)",
  accent: "#D9C9A3", // muted brass — editorial, not "developer blue"
  accentStrong: "#EAD9AE",
  success: "#7FB77E",
  warning: "#E0B15C",
  danger: "#D97C6B",
  info: "#8FB2C9",
};

export const lightTokens = {
  background: "#FAF9F6",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardHover: "#F4F2ED",
  border: "rgba(17,17,17,0.08)",
  borderStrong: "rgba(17,17,17,0.14)",
  textPrimary: "rgba(17,17,17,0.92)",
  textSecondary: "rgba(17,17,17,0.62)",
  textTertiary: "rgba(17,17,17,0.42)",
  accent: "#9C824A",
  accentStrong: "#7E6836",
  success: "#4C8C4A",
  warning: "#B8802E",
  danger: "#B84C3A",
  info: "#3E6E8C",
};

export type ThemeTokens = typeof darkTokens;
