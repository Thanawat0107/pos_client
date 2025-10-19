import { createTheme } from "@mui/material/styles";

export const colors = {
  primary: "#E02200",
  secondary: "#FFEDE5",
  textMain: "#262626",
  darkTextPrimary: "#EDEDED",
  lightBg: "#ffffff",
  darkBg: "#121212",
  darkPaper: "#1A1A1A",
};

// สร้างธีมตามโหมด (light/dark)
export function buildMuiTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
      text: { primary: isDark ? colors.darkTextPrimary : colors.textMain },
      background: {
        default: isDark ? colors.darkBg : colors.lightBg,
        paper: isDark ? colors.darkPaper : colors.lightBg,
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      h1: { fontSize: "28px", fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: "24px", fontWeight: 700, lineHeight: 1.25 },
      h3: { fontSize: "18px", fontWeight: 700, lineHeight: 1.3 },
      h4: { fontSize: "16px", fontWeight: 700, lineHeight: 1.35 },
      h5: { fontSize: "14px", fontWeight: 700, lineHeight: 1.4 },
      h6: { fontSize: "12px", fontWeight: 700, lineHeight: 1.4 },
      body1: { fontSize: "14px", fontWeight: 400, lineHeight: 1.4 },
      body2: { fontSize: "12px", fontWeight: 400, lineHeight: 1.4 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
  });
}

// สำหรับ first paint (จะสลับเป็นโหมดจริงใน AppProviders)
export const materialThemeInitial = buildMuiTheme("light");
