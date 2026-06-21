import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Non-admins go to their neutral home (/dashboard), not /pending — an
  // approved student isn't "pending", and /pending shows misleading
  // course-locked copy. /pending stays for genuinely unapproved users.
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

export async function requireApprovedUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Admins have full access regardless of approval status.
  if (session.user.role !== "admin" && session.user.status !== "approved") {
    redirect("/pending");
  }
  return session;
}

export async function hasCourseAccess(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  return enrollment !== null;
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return await prisma.user.findUnique({
    where: { id: session.user.id },
  });
}
