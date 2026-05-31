"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, KeyRound, User } from "lucide-react";
import { updateName, changePassword } from "../actions";

export function NameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateName(name);
      if (result.ok) toast.success(result.message ?? "Saved.");
      else toast.error(result.error);
    });
  };

  const dirty = name.trim() !== initialName.trim();

  return (
    <section className="surface rounded-2xl border border-theme p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple/10 text-purple-600 dark:text-purple-300">
          <User className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-fg">Display name</h2>
          <p className="text-xs text-muted">
            This is shown on your profile, posts, and certificates.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
          Save name
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
