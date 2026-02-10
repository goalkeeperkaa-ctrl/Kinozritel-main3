import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/profile");
  }

  if (session.user.role !== "ADMIN") {
    return <main className="p-4">Доступ запрещен</main>;
  }

  return <>{children}</>;
}
