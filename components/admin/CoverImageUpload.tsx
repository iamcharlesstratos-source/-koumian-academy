"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Move, ZoomIn } from "lucide-react";

const FRAME_RATIO = 9 / 21; // height / width — matches the course hero banner
const EXPORT_W = 1280;

/**
 * Course cover uploader with adjustable framing. The admin uploads an image,
 * then zooms + drags to position it inside a 21:9 banner. The visible crop is
 * rendered to a canvas and emitted as a compressed JPEG data URL (no upload
 * service needed). Existing covers show as a static preview until replaced.
 */
export function CoverImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(
    null
  );

  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [frameW, setFrameW] = useState(0);

  // Measure the frame width (height is derived from the fixed ratio).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setFrameW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [editSrc]);

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      if (editSrc) URL.revokeObjectURL(editSrc);
    };
  }, [editSrc]);

  const frameH = frameW * FRAME_RATIO;
  const baseScale =
    nat && frameW ? Math.max(frameW / nat.w, frameH / nat.h) : 1;
  const scale = baseScale * zoom;
  const drawW = nat ? nat.w * scale : 0;
  const drawH = nat ? nat.h * scale : 0;

  const clamp = useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.min(0, Math.max(frameW - drawW, o.x)),
      y: Math.min(0, Math.max(frameH - drawH, o.y)),
    }),
    [frameW, frameH, drawW, drawH]
  );

  // Center a freshly-loaded image.
  useEffect(() => {
    if (!nat || !frameW) return;
    const fH = frameW * FRAME_RATIO;
    const bs = Math.max(frameW / nat.w, fH / nat.h);
    const dW = nat.w * bs;
    const dH = nat.h * bs;
    setZoom(1);
    setOffset({ x: (frameW - dW) / 2, y: (fH - dH) / 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nat]);

  // Re-clamp when zoom or frame size changes.
  useEffect(() => {
    setOffset((o) => clamp(o));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, frameW]);

  const exportCover = useCallback(() => {
    const imgEl = imgRef.current;
    if (!imgEl || !nat || !frameW) return;
    const TW = EXPORT_W;
    const TH = Math.round(TW * FRAME_RATIO);
    const k = TW / frameW;
    const canvas = document.createElement("canvas");
    canvas.width = TW;
    canvas.height = TH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f0f14";
    ctx.fillRect(0, 0, TW, TH);
    ctx.drawImage(imgEl, offset.x * k, offset.y * k, drawW * k, drawH * k);
    try {
      onChange(canvas.toDataURL("image/jpeg", 0.82));
    } catch {
      /* canvas could be tainted only for cross-origin; uploads are same-origin */
    }
  }, [nat, frameW, offset, drawW, drawH, onChange]);

  // Auto-export the adjusted crop (debounced) so the form value stays current.
  useEffect(() => {
    if (!editSrc || !nat || !frameW) return;
    const t = setTimeout(exportCover, 150);
    return () => clearTimeout(t);
  }, [editSrc, nat, frameW, zoom, offset, exportCover]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("That image is too large (max 15MB).");
      return;
    }
    if (editSrc) URL.revokeObjectURL(editSrc);
    setNat(null);
    setEditSrc(URL.createObjectURL(file));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!editSrc) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset(
      clamp({ x: d.ox + (e.clientX - d.px), y: d.oy + (e.clientY - d.py) })
    );
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const removeCover = () => {
    if (editSrc) URL.revokeObjectURL(editSrc);
    setEditSrc(null);
    setNat(null);
    onChange("");
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickFile}
      />

      {editSrc ? (
        // ── Editing a freshly uploaded image ──
        <>
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="relative aspect-[21/9] w-full cursor-move overflow-hidden rounded-xl border border-theme bg-black/30 select-none"
            style={{ touchAction: "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={editSrc}
              alt=""
              draggable={false}
              onLoad={(e) =>
                setNat({
                  w: e.currentTarget.naturalWidth,
                  h: e.currentTarget.naturalHeight,
                })
              }
              style={{
                position: "absolute",
                left: offset.x,
                top: offset.y,
                width: drawW || undefined,
                height: drawH || undefined,
                maxWidth: "none",
              }}
            />
            <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              <Move className="h-3 w-3" />
              Drag to reposition
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <ZoomIn className="h-4 w-4 flex-shrink-0 text-muted" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full flex-1 cursor-pointer accent-purple"
              aria-label="Zoom"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-secondary text-xs"
            >
              <Upload className="h-4 w-4" />
              Upload different
            </button>
            <button
              type="button"
              onClick={removeCover}
              className="inline-flex items-center gap-1.5 rounded-full border border-theme-strong bg-current/[0.02] px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </>
      ) : value.trim() ? (
        // ── Existing saved cover (static preview) ──
        <>
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-theme bg-current/[0.03]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Cover preview"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-secondary text-xs"
            >
              <Upload className="h-4 w-4" />
              Change photo
            </button>
            <button
              type="button"
              onClick={removeCover}
              className="inline-flex items-center gap-1.5 rounded-full border border-theme-strong bg-current/[0.02] px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </>
      ) : (
        // ── Empty state ──
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-theme-strong bg-current/[0.02] text-muted transition-colors hover:border-purple-soft/40 hover:text-fg"
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm font-medium">Upload cover photo</span>
          <span className="text-[11px]">JPG or PNG · you can zoom &amp; reposition</span>
        </button>
      )}

      <p className="mt-2 text-[11px] text-muted">
        Shown on the catalog card and at the top of the course page. Upload a
        photo, then zoom and drag to frame it. Leave empty to use the default
        gradient.
      </p>
    </div>
  );
}
