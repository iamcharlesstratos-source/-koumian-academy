import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Sanitize a `callbackUrl` query param so it can only point to a path on this
 * same origin. Prevents open-redirect attacks where an attacker crafts a link
 * like `/login?callbackUrl=https://evil.com`.
 *
 * Returns `fallback` (default `/`) if the URL is not a safe internal path.
 */
export function safeCallbackUrl(
  url: string | string[] | undefined | null,
  fallback = "/"
): string {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  // Must start with a single `/` (relative path), reject `//foo` (protocol-relative)
  // and any absolute URL like `http://...` or `javascript:...`.
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes(":")) return fallback;
  return trimmed;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CATEGORIES = ["business", "marketing", "finance"] as const;
export type Category = (typeof CATEGORIES)[number];

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];
