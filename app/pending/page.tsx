import Link from "next/link";
import { ArrowLeft, Clock, Mail } from "lucide-react";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";

export default async function PendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isApproved = session.user.status === "approved";
  const isRejected = session.user.status === "rejected";

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

      <div className="w-full max-w-lg text-center">
        <div className="mb-10 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="surface rounded-2xl border border-theme p-10 backdrop-blur-sm shadow-2xl">
          {isRejected ? (
            <>
              <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 ring-4 ring-rose-500/5">
                <Mail className="h-6 w-6 text-rose-500 dark:text-rose-300" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-fg">
                Account not approved
              </h1>
              <p className="mt-3 text-balance text-muted">
                Your account was reviewed but not approved at this time. If you
                think this is a mistake, reach out to the Koumian Academy team.
              </p>
            </>
          ) : isApproved ? (
            <>
              <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/5">
                <Mail className="h-6 w-6 text-emerald-500 dark:text-emerald-300" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-fg">
                You&apos;re approved — but this course is locked
              </h1>
              <p className="mt-3 text-balance text-muted">
                Your account is active, but you don&apos;t have access to this
                specific course yet. Admins grant course access individually —
                reach out if you&apos;d like access.
              </p>
            </>
          ) : (
            <>
              <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
                <Clock className="h-6 w-6 text-purple-500 dark:text-purple-300" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-fg">
                Your account is awaiting approval
              </h1>
              <p className="mt-3 text-balance text-muted">
                Thanks for joining Koumian Academy,{" "}
                {session.user.name?.split(" ")[0]}. An admin will review your
                account shortly. You can keep browsing the catalog while you
                wait.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="btn-secondary">
              Browse the catalog
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="btn-secondary">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
