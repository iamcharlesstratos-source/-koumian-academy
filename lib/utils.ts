import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "just now", "5m ago", "3h ago", "2d ago", or a date for older items. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 45) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

/**
 * Deterministic, readable certificate ID derived from the user + course IDs.
 * Same student + same course always yields the same code (e.g. "KA-7F3A-9C21"),
 * so a certificate can be re-printed and the code stays stable for verification.
 * Not cryptographically secure — it's an identifier, not a secret.
 */
export function certificateId(userId: string, courseId: string): string {
  const seed = `${userId}::${courseId}`;
  // Two independent 32-bit FNV-1a-style hashes for a 8-hex-char code.
  let h1 = 0x811c9dc5;
  let h2 = 0x1505;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 = Math.imul(h2, 33) ^ c;
  }
  const a = (h1 >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 4);
  const b = (h2 >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 4);
  return `KA-${a}-${b}`;
}
