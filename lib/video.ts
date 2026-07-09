// Video URL resolver — turns a raw URL into an embeddable source.
// Supports: YouTube, Vimeo, Google Drive, Loom, Facebook, TikTok, and direct
// video files (.mp4 / .webm / .ogg / .m4v).

export type VideoProvider =
  | "youtube"
  | "vimeo"
  | "googleDrive"
  | "loom"
  | "facebook"
  | "tiktok"
  | "mp4"
  | "unknown";

export type ResolvedVideo = {
  /** URL to use in the `src` of either an <iframe> or <video> tag. */
  src: string;
  /** Whether to render the resolved video as an iframe or a native <video> element. */
  kind: "iframe" | "video";
  provider: VideoProvider;
  /** Human-readable label for the provider, e.g. "Google Drive". */
  label: string;
};

const PROVIDER_LABEL: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  googleDrive: "Google Drive",
  loom: "Loom",
  facebook: "Facebook",
  tiktok: "TikTok",
  mp4: "Direct MP4",
  unknown: "Unknown",
};

/**
 * Resolve a raw video URL into something embeddable.
 *
 * `hint` is the admin-chosen provider from the Type dropdown. When set to
 * anything other than "auto", we still try to extract IDs sensibly — but the
 * label/provider in the result respects the hint.
 */
export function resolveVideo(
  url: string,
  hint?: string | null
): ResolvedVideo | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");

  // ── YouTube ──────────────────────────────────────────
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtu.be"
  ) {
    let id = "";
    if (host === "youtu.be") {
      id = parsed.pathname.slice(1).split("/")[0];
    } else {
      id = parsed.searchParams.get("v") || "";
      if (!id) {
        const m = parsed.pathname.match(/^\/(?:embed|shorts|v|live)\/([\w-]+)/);
        if (m) id = m[1];
      }
    }
    if (id) {
      return {
        src: `https://www.youtube.com/embed/${id}`,
        kind: "iframe",
        provider: "youtube",
        label: PROVIDER_LABEL.youtube,
      };
    }
  }

  // ── Vimeo ─────────────────────────────────────────────
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const segs = parsed.pathname.split("/").filter(Boolean);
    const id = segs.find((s) => /^\d+$/.test(s));
    if (id) {
      return {
        src: `https://player.vimeo.com/video/${id}`,
        kind: "iframe",
        provider: "vimeo",
        label: PROVIDER_LABEL.vimeo,
      };
    }
  }

  // ── Google Drive ─────────────────────────────────────
  // https://drive.google.com/file/d/{ID}/view
  // https://drive.google.com/open?id={ID}
  // https://drive.google.com/uc?id={ID}
  if (host === "drive.google.com" || host === "docs.google.com") {
    const m = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const id = m?.[1] ?? parsed.searchParams.get("id");
    if (id) {
      return {
        src: `https://drive.google.com/file/d/${id}/preview`,
        kind: "iframe",
        provider: "googleDrive",
        label: PROVIDER_LABEL.googleDrive,
      };
    }
  }

  // ── Loom ─────────────────────────────────────────────
  // https://www.loom.com/share/{ID}  →  https://www.loom.com/embed/{ID}
  if (host === "loom.com") {
    const m = parsed.pathname.match(/\/(?:share|embed)\/([\w-]+)/);
    if (m) {
      return {
        src: `https://www.loom.com/embed/${m[1]}`,
        kind: "iframe",
        provider: "loom",
        label: PROVIDER_LABEL.loom,
      };
    }
  }

  // ── Facebook ─────────────────────────────────────────
  // https://www.facebook.com/{user}/videos/{ID}
  // https://fb.watch/{ID}
  // Facebook plugin embed wraps any video URL.
  if (
    host === "facebook.com" ||
    host === "fb.watch" ||
    host.endsWith(".facebook.com")
  ) {
    return {
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        trimmed
      )}&show_text=false`,
      kind: "iframe",
      provider: "facebook",
      label: PROVIDER_LABEL.facebook,
    };
  }

  // ── TikTok ───────────────────────────────────────────
  // https://www.tiktok.com/@user/video/{ID}
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const m = parsed.pathname.match(/\/video\/(\d+)/);
    if (m) {
      return {
        src: `https://www.tiktok.com/embed/v2/${m[1]}`,
        kind: "iframe",
        provider: "tiktok",
        label: PROVIDER_LABEL.tiktok,
      };
    }
  }

  // ── Direct video file (.mp4 etc.) ────────────────────
  if (/\.(mp4|webm|ogg|m4v|mov)(\?|$)/i.test(parsed.pathname)) {
    return {
      src: trimmed,
      kind: "video",
      provider: "mp4",
      label: PROVIDER_LABEL.mp4,
    };
  }

  // ── Respect the admin's manual hint as last resort ──
  // If the admin explicitly picked a provider, embed using best-effort.
  if (hint && hint !== "auto") {
    return {
      src: trimmed,
      kind: "iframe",
      provider: (hint as VideoProvider) ?? "unknown",
      label: PROVIDER_LABEL[(hint as VideoProvider) ?? "unknown"],
    };
  }

  return null;
}

/** Backwards-compatible string-only helper. Returns the embed URL or null. */
export function toEmbedUrl(url: string): string | null {
  const r = resolveVideo(url);
  return r?.src ?? null;
}

/** Provider label for a raw URL or null. */
export function detectProviderLabel(url: string): string | null {
  return resolveVideo(url)?.label ?? null;
}

/**
 * Resolve a document/PDF URL into something embeddable inline (an <iframe>).
 * - Google Drive / Docs → the /preview inline reader
 * - Dropbox → direct raw
 * - Any other URL (a direct .pdf, hosted file, etc.) → used as-is; browsers
 *   render PDFs inside an iframe natively.
 * Returns null for empty/invalid input.
 */
export function resolvePdfUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "drive.google.com" || host === "docs.google.com") {
    const m = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const id = m?.[1] ?? parsed.searchParams.get("id");
    if (id) return `https://drive.google.com/file/d/${id}/preview`;
    // docs.google.com/document|presentation|spreadsheets/.../edit → /preview
    if (/\/(document|presentation|spreadsheets)\//.test(parsed.pathname)) {
      return trimmed.replace(/\/(edit|view)(\?.*)?$/, "/preview");
    }
    return trimmed;
  }

  if (host === "dropbox.com" || host.endsWith(".dropbox.com")) {
    return trimmed.replace(/([?&])dl=0/, "$1raw=1");
  }

  return trimmed;
}
