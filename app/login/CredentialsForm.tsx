"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function CredentialsForm({ callbackUrl }: { callbackUrl?: string }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email/username or password.");
        return;
      }
      window.location.href = callbackUrl ?? "/";
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Email or username</label>
        <input
          className="input"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com or username"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input
            className="input pr-12"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full justify-center"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </button>
    </form>
  );
}
