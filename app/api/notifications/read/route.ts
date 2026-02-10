import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

export async function POST() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await prisma.notification.updateMany({ where: { userId: auth.session.user.id, isRead: false }, data: { isRead: true } });
  return ok({ success: true });
}