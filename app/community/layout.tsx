import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentSidebar } from "@/components/community/StudentSidebar";
import { StudentMobileNav } from "@/components/community/StudentMobileNav";

// The community portal is for approved members only. Pending/rejected users
// are sent to /pending; logged-out users to /login.
export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/community");
  if (session.user.status !== "approved") redirect("/pending");

  return (
    <div className="min-h-screen">
      <StudentSidebar user={session.user} />
      <StudentMobileNav />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
