// components/theme/ThemeProvider.tsx
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };
const ThemeCtx = createContext<Ctx | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (localStorage.getItem("poppin-theme") as Theme | null)
      : null);
    const initial: Theme =
      stored ??
      (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "dark");

    apply(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    try {
      localStorage.setItem("poppin-theme", t);
    } catch {}
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
    // notify listeners (maps, etc.)
    window.dispatchEvent(new CustomEvent("poppin-theme", { detail: t }));
  };

  const value = useMemo<Ctx>(
    () => ({
      theme,
      toggle: () => apply(theme === "dark" ? "light" : "dark"),
      setTheme: apply,
    }),
    [theme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
