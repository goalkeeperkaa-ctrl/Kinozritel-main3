import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const list = await prisma.notification.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return ok(list);
}