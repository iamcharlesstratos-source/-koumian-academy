import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// CSV-escape a single field (wrap in quotes if it contains a comma, quote, or
// newline; double any inner quotes).
function esc(value: unknown): string {
  let s = String(value ?? "");
  // Neutralize spreadsheet formula / DDE injection: if a field starts with a
  // formula trigger, prefix a single quote so Excel/Sheets treat it as literal
  // text (name/email are user-controlled). Must run BEFORE the quoting check.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /admin/users/export → downloads a CSV of all members (admin only).
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  let users: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
    _count: { enrollments: number };
  }[] = [];
  let completedByUser = new Map<string, number>();

  try {
    const [rows, completionGroups] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.lessonCompletion.groupBy({
        by: ["userId"],
        _count: { _all: true },
      }),
    ]);
    users = rows;
    completedByUser = new Map(
      completionGroups.map((g) => [g.userId, g._count._all])
    );
  } catch {
    return new Response("Export failed", { status: 500 });
  }

  const header = [
    "Name",
    "Email",
    "Role",
    "Status",
    "Joined",
    "Enrolled courses",
    "Lessons completed",
  ].join(",");

  const lines = users.map((u) =>
    [
      esc(u.name ?? ""),
      esc(u.email),
      esc(u.role),
      esc(u.status),
      esc(u.createdAt.toISOString().slice(0, 10)),
      esc(u._count.enrollments),
      esc(completedByUser.get(u.id) ?? 0),
    ].join(",")
  );

  // Prepend a UTF-8 BOM so Excel opens accented characters correctly.
  const csv = "﻿" + [header, ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="koumian-members-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
