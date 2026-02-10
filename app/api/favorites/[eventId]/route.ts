import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ok } from "@/lib/api/http";

export async function POST(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { eventId } = await params;

  await prisma.favorite.upsert({
    where: { userId_eventId: { userId: auth.session.user.id, eventId } },
    create: { userId: auth.session.user.id, eventId },
    update: {}
  });

  return ok({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { eventId } = await params;

  await prisma.favorite.deleteMany({ where: { userId: auth.session.user.id, eventId } });
  return ok({ success: true });
}