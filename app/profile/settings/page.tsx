import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/public/Nav";
import { Footer } from "@/components/public/Footer";
import { NameForm, PasswordForm } from "./SettingsForms";

export const metadata = { title: "Account Settings — Koumian Academy" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, username: true, passwordHash: true },
  });
  if (!user) redirect("/login");

  return (
    <>
      <Nav user={session.user} />
      <main className="px-6 pb-20 pt-32 sm:pt-40">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/profile"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <header className="mb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
              Account settings
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Manage your account
            </h1>
            <p className="mt-3 text-muted">
              Update your name and password. Your email
              {user.username ? " and username are" : " is"} fixed —{" "}
              <span className="text-fg">{user.email}</span>
              {user.username && (
                <>
                  {" "}
                  (<span className="text-fg">@{user.username}</span>)
                </>
              )}
              .
            </p>
          </header>

          <div className="space-y-6">
            <NameForm initialName={user.name ?? ""} />
            <PasswordForm hasPassword={!!user.passwordHash} />
          </div>
        </div>
      </main>
      <Footer signedIn />
    </>
  );
}
