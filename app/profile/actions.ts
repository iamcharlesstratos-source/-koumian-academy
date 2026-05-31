"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const NAME_MAX = 80;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 200;

/** Update the signed-in user's display name. */
export async function updateName(name: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const trimmed = name.trim();
  if (trimmed.length < 2)
    return { ok: false, error: "Name must be at least 2 characters." };
  if (trimmed.length > NAME_MAX)
    return { ok: false, error: `Name must be ${NAME_MAX} characters or fewer.` };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { ok: true, message: "Name updated." };
}

/**
 * Change or set the signed-in user's password.
 *
 * - If the account already has a password, `currentPassword` must match.
 * - If the account is Google-only (no password yet), `currentPassword` is
 *   ignored and this SETS the first password (so they can also use the
 *   username/password login).
 *
 * Note: the display name in the session JWT only refreshes on next sign-in,
 * but passwords are checked against the DB at login, so changes take effect
 * immediately for future logins.
 */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const newPassword = input.newPassword;
  if (newPassword.length < PASSWORD_MIN)
    return {
      ok: false,
      error: `New password must be at least ${PASSWORD_MIN} characters.`,
    };
  if (newPassword.length > PASSWORD_MAX)
    return { ok: false, error: "New password is too long." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return { ok: false, error: "Account not found." };

  // Existing-password accounts must verify the current password first.
  if (user.passwordHash) {
    if (!input.currentPassword)
      return { ok: false, error: "Enter your current password." };
    const valid = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash
    );
    if (!valid)
      return { ok: false, error: "Your current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return {
    ok: true,
    message: user.passwordHash
      ? "Password changed."
      : "Password set — you can now sign in with your email and password too.",
  };
}
