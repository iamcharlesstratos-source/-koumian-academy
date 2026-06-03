"use client";

import { useEffect } from "react";

/** Registers the PWA service worker so the app is installable. No-op on
 *  unsupported browsers; failures are ignored. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore */
      });
    }
  }, []);
  return null;
}
