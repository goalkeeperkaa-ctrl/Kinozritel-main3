import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/api/http";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({ where: { id: auth.session.user.id } });
  return ok(user);
}

export async function PATCH(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { name, birthDate, cityId, notificationsEvents, notificationsNews } = body as {
    name?: string;
    birthDate?: string;
    cityId?: string;
    notificationsEvents?: boolean;
    notificationsNews?: boolean;
  };

  if (name && name.length > 120) {
    return fail("Слишком длинное имя", 400);
  }

  const updated = await prisma.user.update({
    where: { id: auth.session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(birthDate !== undefined ? { birthDate: birthDate ? new Date(birthDate) : null } : {}),
      ...(cityId !== undefined ? { cityId } : {}),
      ...(notificationsEvents !== undefined ? { notificationsEvents } : {}),
      ...(notificationsNews !== undefined ? { notificationsNews } : {})
    }
  });

  return ok(updated);
}