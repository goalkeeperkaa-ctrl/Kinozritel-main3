import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const occurrences = await prisma.eventOccurrence.findMany({
    where: {
      event: {
        OR: [{ id }, { slug: id }]
      }
    },
    orderBy: { startsAt: "asc" }
  });

  return ok(occurrences);
}