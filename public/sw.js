// Minimal service worker for Koumian Academy.
// Its main job is to make the app installable ("Add to Home Screen"). It does
// NOT aggressively cache, so users always get fresh content from the network —
// this avoids stale pages after a deploy.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass-through: let the browser handle the request normally. Having this
  // handler registered is what enables installability.
});
