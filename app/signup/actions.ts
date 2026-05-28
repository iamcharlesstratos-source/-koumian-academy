"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SignupInput = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type SignupResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 80;
const EMAIL_MAX = 254;

export async function signup(input: SignupInput): Promise<SignupResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const password = input.password;

  if (name.length < 2) {
    return { ok: false, error: "Please enter your name (2+ characters)." };
  }
  if (name.length > NAME_MAX) {
    return { ok: false, error: `Name must be ${NAME_MAX} characters or fewer.` };
  }
  if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error:
        "Username must be 3-24 characters, using lowercase letters, numbers, and underscores only.",
    };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password.length > 200) {
    return { ok: false, error: "Password is too long." };
  }

  const [emailTaken, usernameTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ]);

  if (usernameTaken && (!emailTaken || usernameTaken.id !== emailTaken.id)) {
    return { ok: false, error: "That username is already taken." };
  }

  if (emailTaken && emailTaken.passwordHash) {
    return {
      ok: false,
      error: "An account with this email already exists. Try signing in.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (emailTaken && !emailTaken.passwordHash) {
    // Pre-seeded user (e.g. via make-admin) — set their password now.
    await prisma.user.update({
      where: { id: emailTaken.id },
      data: { name, username, passwordHash },
    });
    return { ok: true, email };
  }

  // Fresh signup. First user (no admin yet) becomes admin/approved automatically.
  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  const role = adminCount === 0 ? "admin" : "user";
  const status = adminCount === 0 ? "approved" : "pending";

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        username,
        passwordHash,
        role,
        status,
      },
    });
  } catch (e) {
    // Race condition: another concurrent signup grabbed this email/username
    // between our findUnique check and create. Surface a friendly error.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const target = (e.meta?.target as string[] | undefined)?.join(",") ?? "";
      if (target.includes("username")) {
        return { ok: false, error: "That username is already taken." };
      }
      return {
        ok: false,
        error: "An account with this email already exists. Try signing in.",
      };
    }
    throw e;
  }

  return { ok: true, email };
}
