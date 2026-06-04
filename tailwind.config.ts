import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Theme-aware tokens (driven by CSS vars in globals.css) ───
        // Use these in NEW code so dark/light just works.
        // text-fg / bg-fg / border-fg → primary text
        // text-muted → muted text
        // bg-surface / border-surface → card background
        // border-theme / text-theme → subtle border
        // border-theme-strong → stronger border
        fg: "var(--color-fg)",
        muted: "var(--color-fg-muted)",
        surface: "var(--color-bg-card)",
        "surface-hover": "var(--color-bg-card-hover)",
        theme: "var(--color-border)",
        "theme-strong": "var(--color-border-strong)",

        // ─── Brand colors (theme-agnostic, intentionally dark-first) ───
        ink: {
          DEFAULT: "#0F0F14",
          50: "#1A1A22",
          100: "#15151C",
          200: "#1F1F28",
          300: "#2A2A36",
        },
        paper: "#F5F5F7",
        haze: {
          DEFAULT: "#7B7B8A",
          light: "#9C9CA8",
          dark: "#5A5A66",
        },
        // Brand accent — indigo (token kept named "purple" so all existing
        // `purple-*` utility classes recolor at once without renaming).
        purple: {
          deep: "#3730A3",
          DEFAULT: "#6366F1",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          soft: "#C7D2FE",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        shimmer: "shimmer 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.25", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.05)" },
        },
      },
      backgroundImage: {
        "violet-glow":
          "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 60%)",
        "grain-noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
