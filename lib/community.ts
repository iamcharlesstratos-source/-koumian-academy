import { prisma } from "@/lib/prisma";
import type { PostCardData } from "@/components/community/PostCard";

/**
 * Load feed/win posts as PostCardData, resiliently. Comments are fetched in a
 * separate query wrapped in try/catch so a not-yet-migrated Comment table
 * degrades to "no comments" instead of crashing the whole page. If even the
 * base Post query fails, we return an empty list rather than throwing.
 */
export async function getPostCards(
  type: "feed" | "win",
  userId: string,
  isAdmin: boolean
): Promise<PostCardData[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { type },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: { select: { name: true, image: true } },
      },
    });
    const postIds = posts.map((p) => p.id);

    // Reactions are loaded separately so a not-yet-migrated `type` column
    // degrades gracefully (everything counts as a "like") instead of breaking
    // the whole feed.
    const reactionsByPost = new Map<string, Map<string, number>>();
    const myReactionByPost = new Map<string, string>();
    if (postIds.length > 0) {
      try {
        let likes: { postId: string; userId: string; type: string }[];
        try {
          likes = await prisma.postLike.findMany({
            where: { postId: { in: postIds } },
            select: { postId: true, userId: true, type: true },
          });
        } catch {
          // `type` column not migrated yet — fall back to plain likes.
          const basic = await prisma.postLike.findMany({
            where: { postId: { in: postIds } },
            select: { postId: true, userId: true },
          });
          likes = basic.map((l) => ({ ...l, type: "like" }));
        }
        for (const l of likes) {
          const m = reactionsByPost.get(l.postId) ?? new Map<string, number>();
          m.set(l.type, (m.get(l.type) ?? 0) + 1);
          reactionsByPost.set(l.postId, m);
          if (l.userId === userId) myReactionByPost.set(l.postId, l.type);
        }
      } catch {
        // PostLike table issue — render posts without reactions.
      }
    }

    const commentsByPost = new Map<string, PostCardData["comments"]>();
    try {
      const comments = await prisma.comment.findMany({
        where: { postId: { in: posts.map((p) => p.id) } },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, image: true } } },
      });
      for (const c of comments) {
        const arr = commentsByPost.get(c.postId) ?? [];
        arr.push({
          id: c.id,
          body: c.body,
          createdAt: c.createdAt.toISOString(),
          authorName: c.author.name,
          authorImage: c.author.image,
          canDelete: c.authorId === userId || isAdmin,
        });
        commentsByPost.set(c.postId, arr);
      }
    } catch {
      // Comment table not migrated yet — render posts without comments.
    }

    return posts.map((p) => ({
      id: p.id,
      type: p.type,
      body: p.body,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt.toISOString(),
      authorName: p.author.name,
      authorImage: p.author.image,
      reactions: Array.from(
        (reactionsByPost.get(p.id) ?? new Map<string, number>()).entries()
      ).map(([t, count]) => ({ type: t, count })),
      myReaction: myReactionByPost.get(p.id) ?? null,
      canDelete: p.authorId === userId || isAdmin,
      comments: commentsByPost.get(p.id) ?? [],
    }));
  } catch {
    return [];
  }
}
