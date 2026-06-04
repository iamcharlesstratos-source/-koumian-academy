"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notify, notifyMany } from "@/lib/notify";

const BODY_MAX = 2000;
const TITLE_MAX = 160;
const URL_MAX = 2048;

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireApproved() {
  const session = await auth();
  if (!session?.user) return null;
  // Admins can always participate/moderate, regardless of approval status.
  if (session.user.role !== "admin" && session.user.status !== "approved") {
    return null;
  }
  return session.user;
}

// ─── Posts (feed + wins) ───────────────────────────────────────────────

export async function createPost(input: {
  body: string;
  type?: "feed" | "win";
  imageUrl?: string;
}): Promise<ActionResult> {
  const user = await requireApproved();
  if (!user) return { ok: false, error: "You must be an approved member to post." };

  const body = input.body.trim();
  const type = input.type === "win" ? "win" : "feed";
  const imageUrl = input.imageUrl?.trim() || null;

  if (!body) return { ok: false, error: "Write something first." };
  if (body.length > BODY_MAX)
    return { ok: false, error: `Keep it under ${BODY_MAX} characters.` };
  if (imageUrl) {
    // Uploaded photos arrive as compressed data: URLs (much larger than a
    // plain link); external links stay bounded by URL_MAX.
    if (imageUrl.startsWith("data:image/")) {
      if (imageUrl.length > 2_500_000)
        return { ok: false, error: "Image is too large. Try a smaller one." };
    } else if (imageUrl.length > URL_MAX) {
      return { ok: false, error: "Image URL is too long." };
    }
  }

  await prisma.post.create({
    data: { authorId: user.id, body, type, imageUrl },
  });

  revalidatePath("/community");
  revalidatePath("/community/wins");
  return { ok: true };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const user = await requireApproved();
  if (!user) return { ok: false, error: "Not allowed." };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  // Author can delete their own post; admins can delete any (moderation).
  if (post.authorId !== user.id && user.role !== "admin") {
    return { ok: false, error: "You can only delete your own posts." };
  }

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/community");
  revalidatePath("/community/wins");
  return { ok: true };
}

const REACTIONS = ["like", "love", "fire", "clap", "insight"];

/**
 * Set (or toggle off) the current user's reaction on a post. One reaction per
 * user per post: re-picking the same reaction removes it; picking a different
 * one switches it. Resilient to a not-yet-migrated `type` column — falls back
 * to plain like/unlike behaviour in that case.
 */
export async function setReaction(
  postId: string,
  type: string
): Promise<ActionResult> {
  const user = await requireApproved();
  if (!user) return { ok: false, error: "Not allowed." };
  const t = REACTIONS.includes(type) ? type : "like";

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
    select: { id: true },
  });

  try {
    if (existing) {
      // Read the current reaction type to decide toggle-off vs switch.
      let currentType = "like";
      try {
        const row = await prisma.postLike.findUnique({
          where: { id: existing.id },
          select: { type: true },
        });
        currentType = row?.type ?? "like";
      } catch {
        /* `type` column missing — treat as a plain like */
      }

      if (currentType === t) {
        await prisma.postLike.delete({ where: { id: existing.id } });
      } else {
        try {
          await prisma.postLike.update({
            where: { id: existing.id },
            data: { type: t },
          });
        } catch {
          /* column missing — leave the existing like in place */
        }
      }
    } else {
      try {
        await prisma.postLike.create({
          data: { postId, userId: user.id, type: t },
        });
      } catch {
        // column missing — create a plain like (DB default applies)
        await prisma.postLike.create({ data: { postId, userId: user.id } });
      }
    }
  } catch {
    return { ok: false, error: "Couldn't save your reaction." };
  }

  revalidatePath("/community");
  revalidatePath("/community/wins");
  return { ok: true };
}

/** Back-compat: a plain like toggles the default reaction. */
export async function toggleLike(postId: string): Promise<ActionResult> {
  return setReaction(postId, "like");
}

// ─── Comments ──────────────────────────────────────────────────────────

export async function createComment(
  postId: string,
  body: string
): Promise<ActionResult> {
  const user = await requireApproved();
  if (!user) return { ok: false, error: "You must be an approved member." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Write a comment first." };
  if (text.length > 1000)
    return { ok: false, error: "Keep comments under 1000 characters." };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, type: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  await prisma.comment.create({
    data: { postId, authorId: user.id, body: text },
  });

  // Notify the post's author (not yourself).
  if (post.authorId !== user.id) {
    await notify(post.authorId, {
      type: "comment",
      title: `${user.name ?? "Someone"} commented on your post`,
      body: text.length > 120 ? `${text.slice(0, 120)}…` : text,
      link: post.type === "win" ? "/community/wins" : "/community",
    });
  }

  revalidatePath("/community");
  revalidatePath("/community/wins");
  return { ok: true };
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const user = await requireApproved();
  if (!user) return { ok: false, error: "Not allowed." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  if (!comment) return { ok: false, error: "Comment not found." };

  // Author or admin can delete.
  if (comment.authorId !== user.id && user.role !== "admin") {
    return { ok: false, error: "You can only delete your own comments." };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/community");
  revalidatePath("/community/wins");
  return { ok: true };
}

// ─── Announcements (admin only) ────────────────────────────────────────

export async function createAnnouncement(input: {
  title: string;
  body: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin")
    return { ok: false, error: "Admins only." };

  const title = input.title.trim();
  const body = input.body.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > TITLE_MAX)
    return { ok: false, error: `Title must be under ${TITLE_MAX} characters.` };
  if (!body) return { ok: false, error: "Write the announcement body." };
  if (body.length > BODY_MAX)
    return { ok: false, error: `Body must be under ${BODY_MAX} characters.` };

  await prisma.announcement.create({
    data: { authorId: session.user.id, title, body },
  });

  // Notify all approved members about the new announcement.
  const recipients = await prisma.user.findMany({
    where: { status: "approved", role: { not: "admin" } },
    select: { id: true },
  });
  await notifyMany(
    recipients.map((r) => r.id),
    {
      type: "announcement",
      title: `📣 New announcement: ${title}`,
      body: body.length > 120 ? `${body.slice(0, 120)}…` : body,
      link: "/community/announcements",
    }
  );

  revalidatePath("/community/announcements");
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin")
    return { ok: false, error: "Admins only." };

  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/community/announcements");
  return { ok: true };
}
