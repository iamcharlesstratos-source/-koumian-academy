import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { auth } from "@/auth";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/");

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
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Join the Koumian Academy.
          </p>

          <div className="mt-8">
            <SignupForm />
          </div>

          <div className="mt-6 rounded-lg border border-purple-soft/30 bg-purple/[0.07] p-4">
            <p className="text-center text-xs leading-relaxed text-purple-700 dark:text-purple-200/90">
              New accounts start in a{" "}
              <strong className="text-purple-900 dark:text-purple-100">
                pending
              </strong>{" "}
              state. You&apos;ll be able to browse the catalog right away —
              course content unlocks once an admin approves your account.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
