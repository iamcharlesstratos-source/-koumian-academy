import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseEditor } from "@/components/admin/CourseEditor";

export default async function EditCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

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
        }))}
      />
    </>
  );
}
