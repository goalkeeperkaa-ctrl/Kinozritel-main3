import Link from "next/link";

const links = [
  { href: "/admin/cities", label: "Города" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/venues", label: "Площадки" },
  { href: "/admin/events", label: "События" }
];

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">Админ-панель</h1>
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl2 bg-pine p-4 text-center text-sm">{link.label}</Link>
        ))}
      </div>
    </main>
  );
}