import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/http";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return ok(categories);
}