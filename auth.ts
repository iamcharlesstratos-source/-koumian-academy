import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

/**
 * Full auth config. Used by server components, route handlers, and server
 * actions — anywhere that runs in the Node.js runtime where Prisma works.
 *
 * The Edge-safe subset (providers without DB calls, JWT/session callbacks)
 * lives in auth.config.ts and is consumed by middleware.ts.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!identifier || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        });

        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const adminCount = await prisma.user.count({
        where: { role: "admin" },
      });
      if (adminCount === 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "admin", status: "approved" },
        });
      }
    },
  },
});
