"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";

export async function setUserStatus(userId: string, status: string) {
  await requireAdmin();
  if (!["approved", "pending", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function setUserRole(userId: string, role: string) {
  await requireAdmin();
  if (!["user", "admin"].includes(role)) {
    throw new Error("Invalid role");
  }
  // Promoting to admin auto-approves the account — an admin has full access,
  // so leaving them "pending"/"rejected" would be contradictory.
  await prisma.user.update({
    where: { id: userId },
    data: role === "admin" ? { role, status: "approved" } : { role },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function grantCourseAccess(userId: string, courseId: string) {
  await requireAdmin();
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });
  revalidatePath("/admin/users");
}

export async function revokeCourseAccess(userId: string, courseId: string) {
  await requireAdmin();
  await prisma.enrollment.deleteMany({
    where: { userId, courseId },
  });
  revalidatePath("/admin/users");
}

export type ResetPasswordResult =
  | { ok: true; tempPassword: string; email: string }
  | { ok: false; error: string };

/**
 * Admin-initiated password reset (no email required).
 *
 * Generates a random temporary password, hashes it, and saves it to the user.
 * Returns the plaintext temp password ONCE so the admin can relay it to the
 * user out-of-band (chat, in person). The user can change it later from their
 * account once a self-service flow exists.
 */
export async function resetUserPassword(
  userId: string
): Promise<ResetPasswordResult> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) return { ok: false, error: "User not found." };

  // 12 random base64url chars — easy to relay, hard to guess.
  const tempPassword = crypto.randomBytes(9).toString("base64url").slice(0, 12);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/users");
  return { ok: true, tempPassword, email: user.email };
}
