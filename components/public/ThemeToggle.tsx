"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group relative inline-flex items-center justify-center rounded-full border border-theme-strong nav-bg backdrop-blur-sm transition-all hover:border-purple-soft/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.25)] ${
        compact ? "h-8 w-8" : "h-9 w-9"
      }`}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
        style={{ color: "#7C3AED" }}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
        style={{ color: "#C4B5FD" }}
      />
    </button>
  );
}
