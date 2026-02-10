import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/api/http";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") || undefined;

  return ok(await prisma.eventOccurrence.findMany({
    where: eventId ? { eventId } : undefined,
    include: { event: true },
    orderBy: { startsAt: "asc" }
  }));
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await req.json();
  if (!body.eventId || !body.startsAt || !body.endsAt) return fail("eventId, startsAt, endsAt обязательны", 400);

  return ok(await prisma.eventOccurrence.create({
    data: {
      eventId: body.eventId,
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt)
    }
  }));
}