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
        likes: { select: { userId: true } },
      },
    });

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
      likeCount: p.likes.length,
      likedByMe: p.likes.some((l) => l.userId === userId),
      canDelete: p.authorId === userId || isAdmin,
      comments: commentsByPost.get(p.id) ?? [],
    }));
  } catch {
    return [];
  }
}
