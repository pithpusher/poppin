// components/theme/ThemeToggle.tsx
"use client";
import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunIcon className="w-6 h-6 text-[rgb(var(--text))]" />
      ) : (
        <MoonIcon className="w-5 h-5 text-[rgb(var(--text))]" />
      )}
    </button>
  );
}
