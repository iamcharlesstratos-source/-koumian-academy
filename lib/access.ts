import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/pending");
  return session;
}

export async function requireApprovedUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.status !== "approved") redirect("/pending");
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
