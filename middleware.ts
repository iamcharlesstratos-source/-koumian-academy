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

  // Not signed in → redirect to /login
  if (!session?.user) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require role=admin
  if (isAdminRoute && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/pending", nextUrl));
  }

  // Lesson + community routes require account approval
  if (
    (isLessonRoute || isCommunityRoute) &&
    session.user.status !== "approved"
  ) {
    return NextResponse.redirect(new URL("/pending", nextUrl));
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
