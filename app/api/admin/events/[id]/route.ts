import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.event.update({
    where: { id },
    data: {
      cityId: body.cityId,
      venueId: body.venueId,
      slug: body.slug,
      title: body.title,
      description: body.description,
      coverUrl: body.coverUrl ?? null,
      priceFrom: body.priceFrom ? Number(body.priceFrom) : null,
      isPublished: body.isPublished
    }
  });

  if (Array.isArray(body.categoryIds)) {
    await prisma.eventCategory.deleteMany({ where: { eventId: id } });
    if (body.categoryIds.length > 0) {
      await prisma.eventCategory.createMany({ data: body.categoryIds.map((categoryId: string) => ({ eventId: id, categoryId })) });
    }
  }

  return ok(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return ok({ success: true });
}