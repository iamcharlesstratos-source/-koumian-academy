"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signup } from "./actions";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signup({ name, email, username, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Signup succeeded — sign in immediately.
      const signInResult = await signIn("credentials", {
        identifier: result.email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setError("Account created, but sign-in failed. Try signing in manually.");
        return;
      }
      window.location.href = "/";
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Full name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan dela Cruz"
          autoComplete="name"
          required
        />
      </div>

      <div>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="label">Username</label>
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          placeholder="lowercase_letters_numbers"
          autoComplete="username"
          minLength={3}
          maxLength={24}
          required
        />
        <p className="mt-1.5 text-[11px] text-muted">
          3-24 characters · lowercase letters, numbers, and underscores
        </p>
      </div>

      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input
            className="input pr-12"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
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
        Create account
      </button>
    </form>
  );
}
