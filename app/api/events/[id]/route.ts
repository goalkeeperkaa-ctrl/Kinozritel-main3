import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isPublished: true
    },
    include: {
      venue: true,
      city: true,
      categories: { include: { category: true } },
      occurrences: { orderBy: { startsAt: "asc" } },
      media: { orderBy: { sortOrder: "asc" } },
      _count: { select: { favorites: true, going: true } }
    }
  });

  if (!event) {
    return fail("Событие не найдено", 404);
  }

  return ok(event);
}