import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AnnouncementComposer } from "@/components/community/AnnouncementComposer";
import {
  AnnouncementCard,
  type AnnouncementData,
} from "@/components/community/AnnouncementCard";
import { Megaphone } from "lucide-react";

export const metadata = { title: "Announcements — Koumian Academy" };

export default async function AnnouncementsPage() {
  const session = await auth();
  const isAdmin = session!.user.role === "admin";

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { name: true } } },
  });

  const data: AnnouncementData[] = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    createdAt: a.createdAt.toISOString(),
    authorName: a.author.name,
    canDelete: isAdmin,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          Community
        </p>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-fg">
          <Megaphone className="h-7 w-7 text-purple-600 dark:text-purple-300" />
          Announcements
        </h1>
        <p className="mt-2 text-sm text-muted">
          Official updates from the Koumian Academy team.
        </p>
      </header>

      {isAdmin && <AnnouncementComposer />}

      {data.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
            <Megaphone className="h-6 w-6 text-purple-500 dark:text-purple-300" />
          </span>
          <h3 className="text-lg font-semibold text-fg">No announcements yet</h3>
          <p className="mt-2 max-w-sm text-balance text-muted">
            {isAdmin
              ? "Post your first announcement to keep members in the loop."
              : "Check back soon for updates from the team."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
