import { extendTheme as extendJoyTheme } from "@mui/joy/styles";
import { createTheme as createMuiTheme } from "@mui/material/styles";

export const colors = {
  primary: "#E02200",
  secondary: "#FFEDE5",
  textMain: "#262626",
  darkTextPrimary: "#EDEDED",
  lightBg: "#ffffff",
  darkBg: "#121212",
  darkPaper: "#1A1A1A",
};

export const joyTheme = extendJoyTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: colors.primary,
          solidHoverBg: "#C41D00",
          solidActiveBg: "#A71900",
          softBg: colors.secondary,
          softColor: colors.textMain,
          plainColor: colors.primary,
          outlinedBorder: colors.primary,
        },
        neutral: {
          plainColor: colors.textMain,
          outlinedColor: colors.textMain,
        },
        text: { primary: colors.textMain },
        background: {
          body: colors.lightBg,
          surface: colors.lightBg,
          level1: "#fafafa",
          level2: "#f5f5f5",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          solidBg: "#FF5533",
          solidHoverBg: "#FF3B16",
          softBg: "#3b1f1a",
          plainColor: "#FF5533",
          outlinedBorder: "#FF5533",
        },
        text: { primary: colors.darkTextPrimary },
        background: {
          body: colors.darkBg,
          surface: colors.darkPaper,
          level1: "#202020",
          level2: "#262626",
        },
      },
    },
  },

  fontFamily: {
    body:
      '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    display:
      '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    code: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },

  // ใช้คีย์ Joy เท่านั้น (เลี่ยง TS error)
  typography: {
    "title-lg": { fontSize: "24px", fontWeight: 700, lineHeight: 1.25 }, // ≈ H2
    "title-md": { fontSize: "18px", fontWeight: 700, lineHeight: 1.3 },  // ≈ H3
    "title-sm": { fontSize: "16px", fontWeight: 700, lineHeight: 1.35 }, // ≈ H4
    "body-lg":  { fontSize: "16px", fontWeight: 400, lineHeight: 1.4 },
    "body-md":  { fontSize: "14px", fontWeight: 400, lineHeight: 1.4 },
    "body-sm":  { fontSize: "12px", fontWeight: 400, lineHeight: 1.4 },
  },

  radius: { sm: "8px", md: "12px", lg: "16px" },
});

// ฟังก์ชันสร้าง Material Theme ตามโหมด (DRY: ใช้ colors ชุดเดียวกับ Joy)
export function buildMuiTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";
  return createMuiTheme({
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
  });
}

// ตัวเลือก: ธีมเริ่มต้นฝั่ง Material (ตอน SSR/first paint) ถ้าอยากใช้ก่อนรู้โหมดจริง
export const materialThemeInitial = buildMuiTheme("light");
