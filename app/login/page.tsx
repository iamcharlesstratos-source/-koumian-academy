import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { CredentialsForm } from "./CredentialsForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { safeCallbackUrl } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl);
  const session = await auth();
  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="surface rounded-2xl border border-theme p-8 backdrop-blur-sm shadow-2xl">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-fg">
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Sign in to continue your learning.
          </p>

          <div className="mt-7">
            <CredentialsForm callbackUrl={callbackUrl} />
          </div>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-current opacity-10" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-current opacity-10" />
          </div>

          <GoogleSignInButton callbackUrl={callbackUrl} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
