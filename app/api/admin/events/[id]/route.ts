import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

function toCategoryIds(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    return raw.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

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

  if (body.categoryIds !== undefined) {
    const categoryIds = toCategoryIds(body.categoryIds);
    await prisma.eventCategory.deleteMany({ where: { eventId: id } });
    if (categoryIds.length > 0) {
      await prisma.eventCategory.createMany({ data: categoryIds.map((categoryId) => ({ eventId: id, categoryId })) });
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
