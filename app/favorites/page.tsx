"use client";

import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setItems(Array.isArray(d) ? d : []));
  }, []);

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">Избранное</h1>
      <section className="space-y-2">
        {items.length === 0 ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Ничего не нашли</p> : null}
        {items.map((item) => (
          <a key={item.eventId} href={`/events/${item.event.slug}`} className="block rounded-xl2 bg-pine/70 p-3">
            <p className="font-medium">{item.event.title}</p>
            <p className="text-xs text-ivory/80">{item.event.venue.name}</p>
          </a>
        ))}
      </section>
    </main>
  );
}