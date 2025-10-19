/* eslint-disable react-refresh/only-export-components */
import * as React from "react";

export type ColorMode = "light" | "dark" | "system";

type Ctx = {
  mode: ColorMode;
  setMode: (m: ColorMode) => void;
  toggle: () => void;
};

const ColorModeContext = React.createContext<Ctx | undefined>(undefined);

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  // โหลดค่าเริ่มจาก localStorage (ครั้งแรกเท่านั้น)
  const [mode, setMode] = React.useState<ColorMode>(() => {
    const saved = localStorage.getItem("color-mode") as ColorMode | null;
    return saved ?? "system";
  });

  // helper สลับโหมดไว ๆ
  const toggle = React.useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
  }, []);

  // sync ลง localStorage ทุกครั้งที่เปลี่ยน
  React.useEffect(() => {
    localStorage.setItem("color-mode", mode);
  }, [mode]);

  const value = React.useMemo(() => ({ mode, setMode, toggle }), [mode, toggle]);
  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  const ctx = React.useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within <ColorModeProvider>");
  return ctx;
}
