import { KoumianLanding } from "@/components/public/KoumianLanding";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // ─── LOGGED-IN: route to the right home ───
  if (session?.user) {
    // Admins → admin dashboard.
    if (session.user.role === "admin") redirect("/admin");
    // Approved students land straight on the community Feed (Facebook-style).
    if (session.user.status === "approved") redirect("/community");
    // Pending/rejected students → their dashboard, which shows the right notice.
    redirect("/dashboard");
  }

  // ─── LOGGED-OUT: Koumian Academy marketing landing (matches the reference) ───
  return <KoumianLanding />;
}
