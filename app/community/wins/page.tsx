import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostComposer } from "@/components/community/PostComposer";
import { PostCard, type PostCardData } from "@/components/community/PostCard";
import { Trophy } from "lucide-react";

export const metadata = { title: "Big Wins — Koumian Academy" };

export default async function WinsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === "admin";

  const posts = await prisma.post.findMany({
    where: { type: "win" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { name: true, image: true } },
      likes: { select: { userId: true } },
    },
  });

  const data: PostCardData[] = posts.map((p) => ({
    id: p.id,
    type: p.type,
    body: p.body,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
    authorName: p.author.name,
    authorImage: p.author.image,
    likeCount: p.likes.length,
    likedByMe: p.likes.some((l) => l.userId === userId),
    canDelete: p.authorId === userId || isAdmin,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-amber-600 dark:text-amber-300">
          Celebrate
        </p>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-fg">
          <Trophy className="h-7 w-7 text-amber-500 dark:text-amber-300" />
          Big Wins
        </h1>
        <p className="mt-2 text-sm text-muted">
          Share your milestones and cheer on everyone else&apos;s. Every win
          counts.
        </p>
      </header>

      <PostComposer
        type="win"
        authorName={session!.user.name}
        authorImage={session!.user.image}
      />

      {data.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 ring-4 ring-amber-500/5">
            <Trophy className="h-6 w-6 text-amber-500 dark:text-amber-300" />
          </span>
          <h3 className="text-lg font-semibold text-fg">No wins shared yet</h3>
          <p className="mt-2 max-w-sm text-balance text-muted">
            Landed a client? Hit a goal? Finished a course? Share it and inspire
            the community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
