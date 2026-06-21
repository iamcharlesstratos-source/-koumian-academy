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
        // Brand accent — violet (token kept named "purple" so all existing
        // `purple-*` utility classes recolor at once without renaming).
        purple: {
          deep: "#5B21B6",
          DEFAULT: "#7C3AED",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#4C1D95",
          900: "#3B1676",
          soft: "#C9B6FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        serif: [
          "var(--font-cormorant)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
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
          "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 60%)",
        "grain-noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
