// components/theme/ThemeToggle.tsx
"use client";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10 html.light:border-zinc-200 html.light:bg-white html.light:hover:bg-zinc-50"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
