import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseEditor } from "@/components/admin/CourseEditor";

// Resilient load: if a newly-added lesson column (e.g. `resources`) hasn't
// been migrated to the DB yet, the all-columns include throws — fall back to
// an explicit select of the known columns so the editor still opens.
async function loadCourse(id: string) {
  try {
    return await prisma.course.findUnique({
      where: { id },
      include: { lessons: { orderBy: { order: "asc" } } },
    });
  } catch {
    return await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            body: true,
            order: true,
            videoUrl: true,
            videoType: true,
            videoDuration: true,
            sections: true,
            takeaways: true,
            proTip: true,
            published: true,
            assignmentEnabled: true,
            assignmentTitle: true,
            assignmentDescription: true,
            assignmentFileTypes: true,
          },
        },
      },
    });
  }
}

export default async function EditCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const course = await loadCourse(params.id);

  if (!course) notFound();

  return (
    <>
      <Link
        href="/admin/courses"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <CourseEditor
        course={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          category: course.category,
          level: course.level,
          durationMin: course.durationMin,
          priceCents: course.priceCents,
          published: course.published,
          coverImageUrl: course.coverImageUrl,
          trailerUrl: course.trailerUrl,
          trailerType: course.trailerType,
        }}
        lessons={course.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          body: l.body,
          order: l.order,
          videoUrl: l.videoUrl,
          videoType: l.videoType,
          videoDuration: l.videoDuration,
          sections: l.sections,
          takeaways: l.takeaways,
          proTip: l.proTip,
          published: l.published,
          assignmentEnabled: l.assignmentEnabled,
          assignmentTitle: l.assignmentTitle,
          assignmentDescription: l.assignmentDescription,
          assignmentFileTypes: l.assignmentFileTypes,
          resources:
            (l as { resources?: string | null }).resources ?? null,
          pdfUrl: (l as { pdfUrl?: string | null }).pdfUrl ?? null,
        }))}
      />
    </>
  );
}
