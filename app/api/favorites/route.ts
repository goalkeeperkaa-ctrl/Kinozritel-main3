import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const items = await prisma.favorite.findMany({
    where: { userId: auth.session.user.id },
    include: {
      event: {
        include: {
          venue: true,
          occurrences: { where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 1 }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return ok(items);
}