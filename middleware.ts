import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Edge-safe auth — no Prisma, no DB calls. The JWT in the cookie carries
// role/status from sign-in, and we trust it here for route gating.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isLessonRoute = /^\/courses\/[^/]+\/lessons\/[^/]+$/.test(path);
  const isCommunityRoute = path.startsWith("/community");

  // Public routes — let through
  if (!isAdminRoute && !isLessonRoute && !isCommunityRoute) {
    return NextResponse.next();
  }

  // Middleware only does the fast "is this person logged in?" check at the
  // edge. Role (admin) and approval (status) are enforced in the server
  // components/layouts using a FRESH database read — see auth.ts's jwt
  // callback. Doing it there (not here) means an admin's approval or role
  // change takes effect immediately, without the user re-logging in. The JWT
  // in the cookie can be stale; we no longer trust it for role/status gating.
  if (!session?.user) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/courses/:slug/lessons/:lessonId",
    "/community/:path*",
  ],
};
