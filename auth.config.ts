import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe auth config. Used by middleware.ts where Prisma cannot run.
 *
 * Do NOT add Prisma calls, the Prisma adapter, or the Credentials provider
 * here — the Credentials provider's `authorize` must hit the DB and that
 * forces this file out of Edge Runtime.
 *
 * The full config in `auth.ts` extends this with the adapter, the
 * Credentials provider, and DB-touching `events`.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, `user` is the freshly authorized user object.
      // We snapshot role/status onto the token. Subsequent requests reuse it.
      if (user) {
        const u = user as { role?: string; status?: string; id?: string };
        token.role = u.role ?? "user";
        token.status = u.status ?? "pending";
        token.uid = u.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.uid as string) ?? (token.sub as string) ?? session.user.id;
        session.user.role = (token.role as string) ?? "user";
        session.user.status = (token.status as string) ?? "pending";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
