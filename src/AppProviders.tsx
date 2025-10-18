import * as React from "react";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import { CssBaseline as JoyBaseline } from "@mui/joy";
import { ThemeProvider as MaterialThemeProvider } from "@mui/material/styles";
import { CssBaseline as MaterialBaseline } from "@mui/material";
import { joyTheme, buildMuiTheme } from "./components/layouts/theme";

function MaterialThemeBridge({ children }: { children: React.ReactNode }) {
  const { mode } = useColorScheme(); // 'light' | 'dark' | 'system'
  const resolvedMode: "light" | "dark" = mode === "dark" ? "dark" : "light";

  const muiTheme = React.useMemo(
    () => buildMuiTheme(resolvedMode),
    [resolvedMode]
  );

  return (
    <MaterialThemeProvider theme={muiTheme}>
      <MaterialBaseline />
      {children}
    </MaterialThemeProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider defaultMode="system" theme={joyTheme}>
      <JoyBaseline />
      <MaterialThemeBridge>{children}</MaterialThemeBridge>
    </CssVarsProvider>
  );
}
