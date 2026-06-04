"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";
import { notify } from "@/lib/notify";

export async function setUserStatus(userId: string, status: string) {
  await requireAdmin();
  if (!["approved", "pending", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
  if (status === "approved") {
    await notify(userId, {
      type: "approval",
      title: "Your account is approved 🎉",
      body: "You now have full access to the community and your courses.",
      link: "/community",
    });
  }
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
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  if (!existing) {
    await prisma.enrollment.create({ data: { userId, courseId } });
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, slug: true },
    });
    if (course) {
      await notify(userId, {
        type: "enrollment",
        title: `New course unlocked: ${course.title}`,
        body: "You now have access — start learning anytime.",
        link: `/courses/${course.slug}`,
      });
    }
  }
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

export type BulkResult =
  | { ok: true; count: number; skipped: number }
  | { ok: false; error: string };

/** Approve / reject / reset-to-pending many users at once. */
export async function bulkSetUserStatus(
  ids: string[],
  status: string
): Promise<BulkResult> {
  const session = await requireAdmin();
  if (!["approved", "pending", "rejected"].includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  // Never change your own status in a bulk op.
  const targetIds = ids.filter((id) => id !== session.user.id);
  if (targetIds.length === 0) {
    return { ok: false, error: "No eligible members selected." };
  }

  // Figure out who is *newly* approved so we only notify them once.
  let toNotify: string[] = [];
  if (status === "approved") {
    const notYet = await prisma.user.findMany({
      where: { id: { in: targetIds }, status: { not: "approved" } },
      select: { id: true },
    });
    toNotify = notYet.map((u) => u.id);
  }

  await prisma.user.updateMany({
    where: { id: { in: targetIds } },
    data: { status },
  });

  await Promise.all(
    toNotify.map((id) =>
      notify(id, {
        type: "approval",
        title: "Your account is approved 🎉",
        body: "You now have full access to the community and your courses.",
        link: "/community",
      })
    )
  );

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return {
    ok: true,
    count: targetIds.length,
    skipped: ids.length - targetIds.length,
  };
}

/** Permanently delete many users at once (reuses the single-delete guards). */
export async function bulkDeleteUsers(ids: string[]): Promise<BulkResult> {
  const session = await requireAdmin();
  const targetIds = ids.filter((id) => id !== session.user.id);
  if (targetIds.length === 0) {
    return { ok: false, error: "You can't delete your own account." };
  }

  // Protect the last admin before we start deleting.
  const [totalAdmins, adminsInSet] = await Promise.all([
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { id: { in: targetIds }, role: "admin" } }),
  ]);
  if (totalAdmins - adminsInSet < 1) {
    return {
      ok: false,
      error: "That would remove the last admin. Keep at least one.",
    };
  }

  let deleted = 0;
  for (const id of targetIds) {
    const res = await deleteUser(id);
    if (res.ok) deleted++;
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, count: deleted, skipped: ids.length - deleted };
}
