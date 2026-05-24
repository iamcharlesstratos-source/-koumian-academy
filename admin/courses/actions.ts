"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";
import { slugify, CATEGORIES, LEVELS } from "@/lib/utils";

type CourseInput = {
  title: string;
  description: string;
  category: string;
  level: string;
  durationMin: number;
  priceCents: number;
  published: boolean;
  slug?: string;
  trailerUrl?: string | null;
  trailerType?: string | null;
};

function validateCourse(input: CourseInput) {
  if (!input.title.trim()) throw new Error("Title is required");
  if (!input.description.trim()) throw new Error("Description is required");
  if (!(CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error("Invalid category");
  }
  if (!(LEVELS as readonly string[]).includes(input.level)) {
    throw new Error("Invalid level");
  }
  if (input.durationMin < 0) throw new Error("Duration must be positive");
  if (input.priceCents < 0) throw new Error("Price must be positive");
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const baseSlug = slugify(base) || "course";
  let candidate = baseSlug;
  let n = 2;
  while (true) {
    const existing = await prisma.course.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}

export async function createCourse(input: CourseInput) {
  await requireAdmin();
  validateCourse(input);

  const slug = await uniqueSlug(input.slug || input.title);

  const course = await prisma.course.create({
    data: {
      title: input.title.trim(),
      description: input.description.trim(),
      slug,
      category: input.category,
      level: input.level,
      durationMin: Math.round(input.durationMin),
      priceCents: Math.round(input.priceCents),
      published: input.published,
      trailerUrl: input.trailerUrl?.trim() || null,
      trailerType: input.trailerType?.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(id: string, input: CourseInput) {
  await requireAdmin();
  validateCourse(input);

  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) throw new Error("Course not found");

  const slug =
    input.slug && input.slug !== existing.slug
      ? await uniqueSlug(input.slug, id)
      : existing.slug;

  await prisma.course.update({
    where: { id },
    data: {
      title: input.title.trim(),
      description: input.description.trim(),
      slug,
      category: input.category,
      level: input.level,
      durationMin: Math.round(input.durationMin),
      priceCents: Math.round(input.priceCents),
      published: input.published,
      trailerUrl: input.trailerUrl?.trim() || null,
      trailerType: input.trailerType?.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidatePath(`/courses/${slug}`);
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  await prisma.course.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

// ─────────── Lessons ───────────

export type LessonSection = { title: string; body: string };

export type LessonInput = {
  title: string;
  body?: string; // legacy/fallback markdown
  videoUrl?: string;
  videoType?: string | null;
  videoDuration?: string | null;
  sections?: LessonSection[];
  takeaways?: string[];
  proTip?: string | null;
  published?: boolean;
  assignmentEnabled?: boolean;
  assignmentTitle?: string | null;
  assignmentDescription?: string | null;
  assignmentFileTypes?: string[];
};

function packLessonData(input: LessonInput) {
  return {
    title: input.title.trim(),
    body: input.body ?? "",
    videoUrl: input.videoUrl?.trim() || null,
    videoType: input.videoType?.trim() || null,
    videoDuration: input.videoDuration?.trim() || null,
    sections: input.sections ? JSON.stringify(input.sections) : null,
    takeaways: input.takeaways ? JSON.stringify(input.takeaways) : null,
    proTip: input.proTip?.trim() || null,
    published: input.published ?? true,
    assignmentEnabled: input.assignmentEnabled ?? false,
    assignmentTitle: input.assignmentTitle?.trim() || null,
    assignmentDescription: input.assignmentDescription?.trim() || null,
    assignmentFileTypes: input.assignmentFileTypes
      ? JSON.stringify(input.assignmentFileTypes)
      : null,
  };
}

export async function createLesson(courseId: string, input: LessonInput) {
  await requireAdmin();
  if (!input.title.trim()) throw new Error("Lesson title is required");

  const last = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 1;

  const created = await prisma.lesson.create({
    data: {
      courseId,
      order: nextOrder,
      ...packLessonData(input),
    },
    select: { id: true, courseId: true, course: { select: { slug: true } } },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${created.course.slug}`);
  return created.id;
}

export async function updateLesson(lessonId: string, input: LessonInput) {
  await requireAdmin();
  if (!input.title.trim()) throw new Error("Lesson title is required");

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: packLessonData(input),
    select: { courseId: true, course: { select: { slug: true } } },
  });

  revalidatePath(`/admin/courses/${lesson.courseId}`);
  revalidatePath(`/courses/${lesson.course.slug}`);
  revalidatePath(`/courses/${lesson.course.slug}/lessons/${lessonId}`);
}

export async function publishAllLessons(courseId: string) {
  await requireAdmin();
  await prisma.lesson.updateMany({
    where: { courseId },
    data: { published: true },
  });
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  revalidatePath(`/admin/courses/${courseId}`);
  if (course) revalidatePath(`/courses/${course.slug}`);
}

export async function deleteLesson(lessonId: string) {
  await requireAdmin();
  const lesson = await prisma.lesson.delete({
    where: { id: lessonId },
    select: { courseId: true, course: { select: { slug: true } } },
  });
  revalidatePath(`/admin/courses/${lesson.courseId}`);
  revalidatePath(`/courses/${lesson.course.slug}`);
}

export async function moveLessonUp(lessonId: string) {
  await requireAdmin();
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true, order: true },
  });
  if (!lesson) return;
  const previous = await prisma.lesson.findFirst({
    where: { courseId: lesson.courseId, order: { lt: lesson.order } },
    orderBy: { order: "desc" },
    select: { id: true, order: true },
  });
  if (!previous) return;
  await swapLessonOrder(lesson, previous);
  revalidatePath(`/admin/courses/${lesson.courseId}`);
}

export async function moveLessonDown(lessonId: string) {
  await requireAdmin();
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true, order: true },
  });
  if (!lesson) return;
  const next = await prisma.lesson.findFirst({
    where: { courseId: lesson.courseId, order: { gt: lesson.order } },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  if (!next) return;
  await swapLessonOrder(lesson, next);
  revalidatePath(`/admin/courses/${lesson.courseId}`);
}

async function swapLessonOrder(
  a: { id: string; order: number },
  b: { id: string; order: number }
) {
  // Use a temporary order to avoid violating the unique [courseId, order] constraint.
  const TEMP = -1;
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: a.id }, data: { order: TEMP } }),
    prisma.lesson.update({ where: { id: b.id }, data: { order: a.order } }),
    prisma.lesson.update({ where: { id: a.id }, data: { order: b.order } }),
  ]);
}
