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

export type DeleteUserResult = { ok: true } | { ok: false; error: string };

/**
 * Permanently delete a user account and all of their data (enrollments,
 * progress, posts, comments, likes, announcements, auth sessions).
 *
 * We delete dependents explicitly in a transaction so it works regardless of
 * whether the database's foreign keys were created with ON DELETE CASCADE.
 * Guards: an admin can't delete themselves, and the last admin can't be
 * removed (so you never lock yourself out).
 */
export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  const session = await requireAdmin();
  if (session.user.id === userId) {
    return { ok: false, error: "You can't delete your own account." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "User not found." };

  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return { ok: false, error: "You can't delete the last admin." };
    }
  }

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    select: { id: true },
  });
  const postIds = posts.map((p) => p.id);

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    prisma.comment.deleteMany({ where: { postId: { in: postIds } } }),
    prisma.postLike.deleteMany({
      where: { OR: [{ userId }, { postId: { in: postIds } }] },
    }),
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.announcement.deleteMany({ where: { authorId: userId } }),
    prisma.lessonCompletion.deleteMany({ where: { userId } }),
    prisma.enrollment.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
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
