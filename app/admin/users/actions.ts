"use server";

import { revalidatePath } from "next/cache";
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
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/admin/users");
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
