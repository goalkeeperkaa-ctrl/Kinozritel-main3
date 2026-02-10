import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/http";

export async function GET() {
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  return ok(cities);
}