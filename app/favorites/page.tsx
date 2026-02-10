"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    fetch("/api/favorites")
      .then(async (r) => {
        if (r.status === 401) {
          setUnauthorized(true);
          return [];
        }
        if (!r.ok) return [];
        return await r.json();
      })
      .then((d) => setItems(Array.isArray(d) ? d : []));
  }, []);

  if (unauthorized) {
    return (
      <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
        <h1 className="text-2xl font-bold">Избранное</h1>
        <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Войдите в профиль, чтобы сохранять избранное.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">Избранное</h1>
      <section className="space-y-2">
        {items.length === 0 ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Ничего не нашли</p> : null}
        {items.map((item) => (
          <Link key={item.eventId} href={`/events/${item.event.slug}`} className="block rounded-xl2 bg-pine/70 p-3">
            <p className="font-medium">{item.event.title}</p>
            <p className="text-xs text-ivory/80">{item.event.venue.name}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
