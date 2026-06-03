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
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Runs in the Node runtime (server components, actions, route handlers),
     * where Prisma is available. On initial sign-in we snapshot role/status
     * from the authorized user. On EVERY subsequent request we re-read
     * role/status from the database, so admin changes (approval, role,
     * rejection) take effect immediately — the user does NOT have to log out
     * and back in. The Edge middleware keeps using the lightweight callback in
     * auth.config.ts (no DB) and only checks "is logged in".
     */
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; status?: string; id?: string };
        token.role = u.role ?? "user";
        token.status = u.status ?? "pending";
        token.uid = u.id;
        return token;
      }

      const uid = (token.uid as string) ?? (token.sub as string);
      if (uid) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: uid },
            select: { role: true, status: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
          }
        } catch {
          // If the lookup fails, keep the existing token values.
        }
      }
      return token;
    },
  },
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
          // Explicit select (no optional columns like bio) so login keeps
          // working even if a newer column hasn't been migrated yet.
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            status: true,
            passwordHash: true,
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
