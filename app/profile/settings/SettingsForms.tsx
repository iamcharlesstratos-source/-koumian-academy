"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, KeyRound, User, Upload, X } from "lucide-react";
import { updateProfile, changePassword } from "../actions";

/**
 * Read an image File, crop to a centered square, downscale to 256px, and
 * return a compressed JPEG data URL — all in the browser. Keeps avatars tiny
 * (~20-40KB) so we can store them directly without any upload service.
 */
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no-canvas"));
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("bad-image"));
    };
    img.src = objectUrl;
  });
}

export function ProfileForm({
  initialName,
  initialBio,
  initialImage,
}: {
  initialName: string;
  initialBio: string;
  initialImage: string;
}) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [image, setImage] = useState(initialImage);
  const [processing, setProcessing] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("That image is too large (max 10MB).");
      return;
    }
    setProcessing(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setImage(dataUrl);
    } catch {
      toast.error("Couldn't read that image. Try another.");
    } finally {
      setProcessing(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile({ name, bio, image });
      if (result.ok) toast.success(result.message ?? "Saved.");
      else toast.error(result.error);
    });
  };

  const dirty =
    name.trim() !== initialName.trim() ||
    bio.trim() !== initialBio.trim() ||
    image.trim() !== initialImage.trim();

  return (
    <section className="surface rounded-2xl border border-theme p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple/10 text-purple-600 dark:text-purple-300">
          <User className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-fg">Profile</h2>
          <p className="text-xs text-muted">
            Your name, photo, and bio appear on your profile and posts.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Avatar upload */}
        <div>
          <span className="label">Profile photo</span>
          <div className="flex items-center gap-4">
            {image.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                referrerPolicy="no-referrer"
                className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-purple/20"
              />
            ) : (
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-purple/15 text-xl font-semibold text-purple-700 ring-2 ring-purple/10 dark:text-purple-200">
                {name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={processing}
                  className="btn-secondary text-xs disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {image.trim() ? "Change photo" : "Upload photo"}
                </button>
                {image.trim() && (
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 rounded-full border border-theme-strong bg-current/[0.02] px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-fg disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                JPG or PNG. We&apos;ll crop it to a square. Max 10MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="input"
            placeholder="Your name"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label className="label" htmlFor="bio">
              Bio / headline
            </label>
            <span className="text-[10px] text-muted">{bio.length}/160</span>
          </div>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={2}
            className="input resize-none"
            placeholder="e.g. Marketing student · Aspiring entrepreneur"
          />
        </div>

        <button
          type="submit"
          disabled={pending || !dirty || name.trim().length < 2}
          className="btn-primary disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save profile
        </button>
      </form>
    </section>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("New passwords don't match.");
      return;
    }
    startTransition(async () => {
      const result = await changePassword({
        currentPassword: current,
        newPassword: next,
      });
      if (result.ok) {
        toast.success(result.message ?? "Password updated.");
        setCurrent("");
        setNext("");
        setConfirm("");
      } else toast.error(result.error);
    });
  };

  return (
    <section className="surface rounded-2xl border border-theme p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple/10 text-purple-600 dark:text-purple-300">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-fg">
            {hasPassword ? "Change password" : "Set a password"}
          </h2>
          <p className="text-xs text-muted">
            {hasPassword
              ? "Update the password you use to sign in."
              : "You signed up with Google. Set a password to also sign in with your email."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {hasPassword && (
          <div>
            <label className="label" htmlFor="current">
              Current password
            </label>
            <input
              id="current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="new">
            New password
          </label>
          <input
            id="new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={200}
            className="input"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={200}
            className="input"
            placeholder="Re-enter new password"
          />
        </div>
        <button
          type="submit"
          disabled={pending || next.length < 8 || !confirm}
          className="btn-primary disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          {hasPassword ? "Change password" : "Set password"}
        </button>
      </form>
    </section>
  );
}
