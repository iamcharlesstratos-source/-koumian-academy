// Usage:
//   node --env-file=.env scripts/make-admin.mjs <email> [--username=name] [--password=pw]
//
// Marks the given email address as an admin (role=admin, status=approved).
// If --password is supplied, also sets a hashed password so the admin can sign
// in via the username/password form. If --password is omitted, only the role
// and status are set (login must happen via Google OAuth).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.replace(/^--/, "").split("=");
      return [k, rest.join("=") || "true"];
    })
);

const email = (positional[0] || "").trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("\n  Usage:  node --env-file=.env scripts/make-admin.mjs <email> [--username=name] [--password=pw]\n");
  process.exit(1);
}

let username = flags.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") || null;
let password = flags.password || null;
let generated = false;

if (flags["generate-password"] === "true" && !password) {
  password = crypto.randomBytes(12).toString("base64url").slice(0, 16);
  generated = true;
}

const updateData = { role: "admin", status: "approved" };
if (username) updateData.username = username;
if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

const result = await prisma.user.upsert({
  where: { email },
  update: updateData,
  create: {
    email,
    name: flags.name || username || email.split("@")[0],
    ...updateData,
  },
});

console.log("\n  ✓  Admin account ready.\n");
console.log(`     email:    ${result.email}`);
if (result.username) console.log(`     username: ${result.username}`);
console.log(`     role:     ${result.role}`);
console.log(`     status:   ${result.status}`);
if (generated) {
  console.log(`\n  🔑 GENERATED PASSWORD (save this — shown only once):\n`);
  console.log(`     ${password}\n`);
} else if (password) {
  console.log(`\n  ✓  Password set.`);
}
console.log(`\n  Sign in at  http://localhost:3000/login  using the email or username and password.\n`);

await prisma.$disconnect();
