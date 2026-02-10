import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/api/http";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return ok(await prisma.event.findMany({ include: { city: true, venue: true, categories: { include: { category: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await req.json();

  if (!body.cityId || !body.venueId || !body.slug || !body.title || !body.description) {
    return fail("Не хватает обязательных полей", 400);
  }

  const event = await prisma.event.create({
    data: {
      cityId: body.cityId,
      venueId: body.venueId,
      slug: body.slug,
      title: body.title,
      description: body.description,
      coverUrl: body.coverUrl ?? null,
      priceFrom: body.priceFrom ? Number(body.priceFrom) : null,
      isPublished: body.isPublished ?? true
    }
  });

  const categoryIds: string[] = Array.isArray(body.categoryIds) ? body.categoryIds : [];
  if (categoryIds.length) {
    await prisma.eventCategory.createMany({ data: categoryIds.map((categoryId) => ({ eventId: event.id, categoryId })) });
  }

  return ok(event);
}