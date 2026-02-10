import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/api/http";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return ok(await prisma.venue.findMany({ include: { city: true }, orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await req.json();
  if (!body.name || !body.cityId || body.lat == null || body.lng == null) return fail("Не хватает полей", 400);
  return ok(await prisma.venue.create({ data: { cityId: body.cityId, name: body.name, address: body.address ?? "", lat: Number(body.lat), lng: Number(body.lng) } }));
}