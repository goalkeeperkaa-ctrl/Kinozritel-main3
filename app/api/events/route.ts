import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/http";
import { buildEventWhere } from "@/lib/api/events";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));
  const timeSlot = searchParams.get("timeSlot");
  const slotFilter = timeSlot ? timeSlot.toLowerCase() : null;

  const where = buildEventWhere(searchParams);

  const events = await prisma.event.findMany({
    where,
    include: {
      venue: true,
      categories: { include: { category: true } },
      occurrences: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 8
      },
      _count: {
        select: { favorites: true, going: true }
      }
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit
  });

  const filtered = events.filter((event: (typeof events)[number]) => {
    if (!slotFilter) return true;
    return event.occurrences.some((o: (typeof event.occurrences)[number]) => {
      const h = o.startsAt.getHours();
      if (slotFilter === "morning") return h >= 6 && h < 12;
      if (slotFilter === "day") return h >= 12 && h < 17;
      if (slotFilter === "evening") return h >= 17 && h < 22;
      if (slotFilter === "night") return h >= 22 || h < 6;
      return true;
    });
  });

  const total = await prisma.event.count({ where: where as Prisma.EventWhereInput });

  return ok({ items: filtered, page, limit, total, hasMore: page * limit < total });
}