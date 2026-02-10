import Link from "next/link";

const nav = [
  { href: "/", label: "Лента" },
  { href: "/map", label: "Карта" },
  { href: "/calendar", label: "Календарь" },
  { href: "/favorites", label: "Избранное" },
  { href: "/profile", label: "Профиль" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ivory">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 mx-auto grid w-full max-w-screen-md grid-cols-5 gap-1 border-t border-ivory/10 bg-bg/95 p-2 backdrop-blur">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-xl2 px-2 py-2 text-center text-[11px] text-ivory/90">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}