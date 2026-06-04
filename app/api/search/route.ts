import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Lightweight JSON search for the ⌘K command palette. Students get published
// courses; admins also get members. Always returns a safe shape (degrades to
// empty on any error) so the palette never throws.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ courses: [], members: [] });

  const isAdmin = session.user.role === "admin";
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (!q) return Response.json({ courses: [], members: [] });

  try {
    const [courses, members] = await Promise.all([
      prisma.course.findMany({
        where: {
          ...(isAdmin ? {} : { published: true }),
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, slug: true, title: true, category: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      isAdmin
        ? prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, name: true, email: true, image: true },
            orderBy: { createdAt: "desc" },
            take: 6,
          })
        : Promise.resolve([]),
    ]);
    return Response.json({ courses, members });
  } catch {
    return Response.json({ courses: [], members: [] });
  }
}
