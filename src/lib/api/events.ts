import { Prisma } from "@prisma/client";

export function parseIds(csv: string | null) {
  if (!csv) return [];
  return csv.split(",").map((x) => x.trim()).filter(Boolean);
}

export function timeSlotRange(slot: string | null) {
  switch (slot) {
    case "morning":
      return { gte: 6, lt: 12 };
    case "day":
      return { gte: 12, lt: 17 };
    case "evening":
      return { gte: 17, lt: 22 };
    case "night":
      return { gte: 22, lt: 24 };
    default:
      return null;
  }
}

export function buildEventWhere(searchParams: URLSearchParams): Prisma.EventWhereInput {
  const cityId = searchParams.get("cityId") || undefined;
  const q = searchParams.get("q") || undefined;
  const categoryIds = parseIds(searchParams.get("categoryIds"));
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const bbox = searchParams.get("bbox");

  const where: Prisma.EventWhereInput = {
    isPublished: true,
    ...(cityId ? { cityId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { venue: { name: { contains: q, mode: "insensitive" } } }
          ]
        }
      : {})
  };

  if (categoryIds.length > 0) {
    where.categories = { some: { categoryId: { in: categoryIds } } };
  }

  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map(Number);
    if ([minLng, minLat, maxLng, maxLat].every(Number.isFinite)) {
      where.venue = {
        lng: { gte: minLng, lte: maxLng },
        lat: { gte: minLat, lte: maxLat }
      };
    }
  }

  if (dateFrom || dateTo) {
    where.occurrences = {
      some: {
        startsAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {})
        }
      }
    };
  }

  return where;
}