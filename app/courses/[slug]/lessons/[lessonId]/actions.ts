"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/access";

export type CompletionResult =
  | { ok: true; completed: boolean }
  | { ok: false; error: string };

export async function toggleLessonComplete(
  lessonId: string
): Promise<CompletionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in." };
  if (session.user.status !== "approved")
    return { ok: false, error: "Account is not approved." };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { id: true, slug: true } } },
  });
  if (!lesson) return { ok: false, error: "Lesson not found." };

  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    const access = await hasCourseAccess(session.user.id, lesson.course.id);
    if (!access) return { ok: false, error: "You don't have access to this course." };
  }

  const existing = await prisma.lessonCompletion.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  if (existing) {
    await prisma.lessonCompletion.delete({
      where: { id: existing.id },
    });
    revalidatePath(`/courses/${lesson.course.slug}/lessons/${lessonId}`);
    revalidatePath(`/courses/${lesson.course.slug}`);
    revalidatePath("/profile");
    return { ok: true, completed: false };
  }

  await prisma.lessonCompletion.create({
    data: { userId: session.user.id, lessonId },
  });
  revalidatePath(`/courses/${lesson.course.slug}/lessons/${lessonId}`);
  revalidatePath(`/courses/${lesson.course.slug}`);
  revalidatePath("/profile");
  return { ok: true, completed: true };
}
