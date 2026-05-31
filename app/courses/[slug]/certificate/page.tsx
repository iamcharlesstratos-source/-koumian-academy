import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Award, Lock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { certificateId } from "@/lib/utils";
import { CertificateActions } from "@/components/public/CertificateActions";

export const metadata = { title: "Certificate — Koumian Academy" };

export default async function CertificatePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/courses/${params.slug}/certificate`);
  }

  const isAdmin = session.user.role === "admin";

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      lessons: {
        where: { published: true },
        select: { id: true },
      },
    },
  });

  if (!course) notFound();

  // Completion check: every published lesson must be marked complete.
  const lessonIds = course.lessons.map((l) => l.id);
  const completedCount =
    lessonIds.length === 0
      ? 0
      : await prisma.lessonCompletion.count({
          where: { userId: session.user.id, lessonId: { in: lessonIds } },
        });

  const isComplete = lessonIds.length > 0 && completedCount === lessonIds.length;

  // Gate: only fully-completed students (or admins, for preview) get a certificate.
  if (!isComplete && !isAdmin) {
    return (
      <main className="px-6 pb-20 pt-32 sm:pt-40">
        <div className="surface mx-auto max-w-lg rounded-2xl border border-theme p-10 text-center">
          <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
            <Lock className="h-6 w-6 text-purple-500 dark:text-purple-300" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Certificate locked
          </h1>
          <p className="mt-3 text-balance text-muted">
            Finish all {lessonIds.length} lesson
            {lessonIds.length === 1 ? "" : "s"} in{" "}
            <span className="text-fg">{course.title}</span> to unlock your
            certificate of completion.
          </p>
          <p className="mt-2 text-sm text-muted">
            You&apos;ve completed {completedCount} of {lessonIds.length}.
          </p>
          <Link
            href={`/courses/${course.slug}`}
            className="btn-primary mt-7 w-full justify-center"
          >
            Back to course
          </Link>
        </div>
      </main>
    );
  }

  const recipientName =
    session.user.name?.trim() || session.user.email || "Koumian Member";
  const certId = certificateId(session.user.id, course.id);
  const issued = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="px-6 pb-20 pt-28 sm:pt-32">
      <CertificateActions backHref={`/courses/${course.slug}`} />

      {!isComplete && isAdmin && (
        <div className="no-print mx-auto mb-6 max-w-4xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-700 dark:text-amber-300">
          Admin preview — this learner hasn&apos;t completed the course yet.
        </div>
      )}

      <div className="cert-sheet mx-auto max-w-4xl">
        <div className="cert-card relative overflow-hidden rounded-3xl border-4 border-double border-purple/40 bg-gradient-to-br from-[#1a0b2e] via-[#0f0f14] to-[#2a0a3a] p-10 text-center shadow-2xl shadow-purple/20 sm:p-16">
          {/* Decorative glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-700/20 blur-3xl"
          />

          {/* Corner flourishes */}
          <span className="pointer-events-none absolute left-5 top-5 h-10 w-10 rounded-tl-2xl border-l-2 border-t-2 border-purple-400/50" />
          <span className="pointer-events-none absolute right-5 top-5 h-10 w-10 rounded-tr-2xl border-r-2 border-t-2 border-purple-400/50" />
          <span className="pointer-events-none absolute bottom-5 left-5 h-10 w-10 rounded-bl-2xl border-b-2 border-l-2 border-purple-400/50" />
          <span className="pointer-events-none absolute bottom-5 right-5 h-10 w-10 rounded-br-2xl border-b-2 border-r-2 border-purple-400/50" />

          <div className="relative">
            {/* Brand mark */}
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-purple/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-badge.png"
                  alt="Koumian Academy"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="flex flex-col items-start leading-none">
                <span className="text-xl font-semibold tracking-tight text-white">
                  Koumian
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-purple-300">
                  Academy
                </span>
              </span>
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.4em] text-purple-300">
              Certificate of Completion
            </p>

            <div className="mx-auto my-6 flex items-center justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-purple-400/40 bg-purple/15">
                <Award className="h-8 w-8 text-purple-200" />
              </span>
            </div>

            <p className="text-sm text-purple-200/70">This certifies that</p>
            <h1 className="mt-3 text-balance bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
              {recipientName}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-balance text-sm leading-relaxed text-purple-100/80">
              has successfully completed all lessons of the course
            </p>
            <h2 className="mt-3 text-balance text-2xl font-semibold text-white sm:text-3xl">
              {course.title}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-purple-300/70">
              {course.category} · {course.level}
            </p>

            {/* Footer line: signature, seal, meta */}
            <div className="mt-12 flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
              <div className="text-center sm:text-left">
                <p className="border-t border-purple-300/30 pt-2 font-[cursive] text-lg text-white">
                  Koumian Academy
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300/60">
                  Issuing Authority
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-300">
                  Learn · Grow · Elevate
                </p>
              </div>

              <div className="text-center sm:text-right">
                <p className="border-t border-purple-300/30 pt-2 text-sm text-white">
                  {issued}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300/60">
                  Date Issued
                </p>
              </div>
            </div>

            <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-purple-300/50">
              Certificate ID · {certId}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
