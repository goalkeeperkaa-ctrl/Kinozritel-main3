import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await req.json();
  return ok(await prisma.venue.update({ where: { id }, data: { cityId: body.cityId, name: body.name, address: body.address, lat: Number(body.lat), lng: Number(body.lng) } }));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.venue.delete({ where: { id } });
  return ok({ success: true });
}