import * as React from "react";
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { buildMuiTheme } from "./components/layouts/theme";
import { ColorModeProvider, useColorMode } from "./contexts/color-mode";

function ThemedApp({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const { mode } = useColorMode();

  const resolvedMode: "light" | "dark" =
    mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const theme = React.useMemo(() => buildMuiTheme(resolvedMode), [resolvedMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <ThemedApp>{children}</ThemedApp>
    </ColorModeProvider>
  );
}
