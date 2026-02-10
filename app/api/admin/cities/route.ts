import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/api/http";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return ok(await prisma.city.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await req.json();
  if (!body.name || !body.slug) return fail("name и slug обязательны", 400);
  return ok(await prisma.city.create({ data: { name: body.name, slug: body.slug } }));
}