import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/api/http";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const items = await prisma.searchHistory.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return ok(items);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const q = String(body?.query ?? "").trim();

  if (!q) return fail("Пустой запрос", 400);

  await prisma.searchHistory.create({ data: { userId: auth.session.user.id, query: q } });

  const top = await prisma.searchHistory.findMany({ where: { userId: auth.session.user.id }, orderBy: { createdAt: "desc" } });
  if (top.length > 10) {
    const remove = top.slice(10);
    await prisma.searchHistory.deleteMany({ where: { id: { in: remove.map((x) => x.id) } } });
  }

  return ok({ success: true });
}

export async function DELETE() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  await prisma.searchHistory.deleteMany({ where: { userId: auth.session.user.id } });
  return ok({ success: true });
}