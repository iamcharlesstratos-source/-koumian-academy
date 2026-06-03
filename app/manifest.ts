import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Koumian Academy",
    short_name: "Koumian",
    description:
      "Learn. Grow. Elevate. — premium courses in business, marketing, and finance.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F0F14",
    theme_color: "#0F0F14",
    icons: [
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
