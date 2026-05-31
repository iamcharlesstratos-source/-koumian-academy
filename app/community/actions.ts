"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const BODY_MAX = 2000;
const TITLE_MAX = 160;
const URL_MAX = 2048;

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireApproved() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.status !== "approved") return null;
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
  if (imageUrl && imageUrl.length > URL_MAX)
    return { ok: false, error: "Image URL is too long." };

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

export async function toggleLike(
  postId: string
): Promise<{ ok: true; liked: boolean } | { ok: false; error: string }> {
  const user = await requireApproved();
  if (!user) return { ok: false, error: "Not allowed." };

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    revalidatePath("/community");
    revalidatePath("/community/wins");
    return { ok: true, liked: false };
  }

  await prisma.postLike.create({ data: { postId, userId: user.id } });
  revalidatePath("/community");
  revalidatePath("/community/wins");
  return { ok: true, liked: true };
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
