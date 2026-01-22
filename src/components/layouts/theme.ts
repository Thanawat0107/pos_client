import { createTheme, alpha } from "@mui/material/styles";

export const colors = {
  primary: "#E02200",
  secondary: "#FFEDE5",
  textMain: "#262626",
  darkTextPrimary: "#EDEDED",
  lightBg: "#F8F9FA", // ปรับให้เทาจางๆ นิดหน่อยเพื่อให้ Card สีขาวลอยเด่นขึ้น
  darkBg: "#0F0F0F",  // ปรับให้เข้มขึ้นอีกนิดเพื่อความ Premium
  darkPaper: "#1A1A1A",
};

// สร้าง Soft Shadows ชุดใหม่
const customShadows = (mode: "light" | "dark") => ({
  low: mode === "light" 
    ? "0px 2px 4px rgba(0,0,0,0.05)" 
    : "0px 2px 4px rgba(0,0,0,0.2)",
  medium: mode === "light" 
    ? "0px 8px 24px rgba(149, 157, 165, 0.2)" 
    : "0px 8px 24px rgba(0, 0, 0, 0.4)",
  high: mode === "light" 
    ? "0px 12px 32px rgba(0,0,0,0.12)" 
    : "0px 12px 32px rgba(0,0,0,0.5)",
});

export function buildMuiTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";
  const shadows = customShadows(mode);

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: { 
        main: colors.primary,
        light: alpha(colors.primary, 0.1), // สำหรับทำ Hover หรือ Background จางๆ
        dark: "#B81C00",
      },
      secondary: { main: colors.secondary },
      text: { 
        primary: isDark ? colors.darkTextPrimary : colors.textMain,
        secondary: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
      },
      background: {
        default: isDark ? colors.darkBg : colors.lightBg,
        paper: isDark ? colors.darkPaper : "#ffffff",
      },
    },
    shape: { borderRadius: 16 }, // เพิ่มความโค้งมนให้ดู Modern ขึ้น
    typography: {
      fontFamily: '"Poppins", "Prompt", system-ui, sans-serif', // เพิ่ม Prompt สำหรับภาษาไทย
      h1: { fontSize: "2.5rem", fontWeight: 800 },
      h2: { fontSize: "2rem", fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 }, // ปิดตัวพิมพ์ใหญ่ทั้งหมด
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // ปรับแต่ง Scrollbar ให้ดูทันสมัย
          "body::-webkit-scrollbar": {
            width: "8px",
          },
          "body::-webkit-scrollbar-thumb": {
            backgroundColor: isDark ? "#333" : "#ccc",
            borderRadius: "10px",
          },
          "body::-webkit-scrollbar-thumb:hover": {
            backgroundColor: colors.primary,
          },
          // ทำให้การเลื่อนหน้าจอนุ่มนวล
          html: { scrollBehavior: "smooth" },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: "12px",
            padding: "8px 20px",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)", // ให้ปุ่มยกตัวขึ้นนิดหน่อยตอน Hover
              boxShadow: shadows.medium,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: shadows.low,
            borderRadius: "20px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            backgroundImage: "none", // ลบ Overlay สีเทาใน Dark Mode
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              backgroundColor: isDark ? alpha("#fff", 0.03) : alpha("#000", 0.02),
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.04),
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
}