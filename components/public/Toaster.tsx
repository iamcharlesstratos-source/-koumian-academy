"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "./ThemeProvider";

// Theme-aware wrapper around sonner's Toaster so toasts match the active
// light/dark mode and the brand violet accent.
export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "12px",
        },
      }}
    />
  );
}
