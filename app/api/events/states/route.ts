import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

export async function GET(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const eventIds = (searchParams.get("eventIds") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (eventIds.length === 0) {
    return ok({ favorites: [], going: [] });
  }

  const [favorites, going] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: auth.session.user.id, eventId: { in: eventIds } },
      select: { eventId: true }
    }),
    prisma.going.findMany({
      where: { userId: auth.session.user.id, eventId: { in: eventIds } },
      select: { eventId: true }
    })
  ]);

  return ok({
    favorites: favorites.map((x) => x.eventId),
    going: going.map((x) => x.eventId)
  });
}
