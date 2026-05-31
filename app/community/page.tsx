import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuoteRotator } from "@/components/community/QuoteRotator";
import { PostComposer } from "@/components/community/PostComposer";
import { PostCard, type PostCardData } from "@/components/community/PostCard";
import { Newspaper } from "lucide-react";

export const metadata = { title: "Community Feed — Koumian Academy" };

export default async function FeedPage() {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === "admin";

  const posts = await prisma.post.findMany({
    where: { type: "feed" },
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
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          Community
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">Feed</h1>
        <p className="mt-2 text-sm text-muted">
          Share ideas, ask questions, and connect with fellow members.
        </p>
      </header>

      <QuoteRotator />

      <PostComposer
        authorName={session!.user.name}
        authorImage={session!.user.image}
      />

      {data.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
            <Newspaper className="h-6 w-6 text-purple-500 dark:text-purple-300" />
          </span>
          <h3 className="text-lg font-semibold text-fg">No posts yet</h3>
          <p className="mt-2 max-w-sm text-balance text-muted">
            Be the first to share something with the community.
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
