"use client";

import { useEffect, useState } from "react";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/events?dateFrom=${date}T00:00:00.000Z&dateTo=${date}T23:59:59.999Z&limit=50`)
      .then((r) => r.json())
      .then((d) => setItems(d.items));
  }, [date]);

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">Календарь</h1>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl2 bg-pine px-3 py-2" />
      <section className="space-y-2">
        {items.length === 0 ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Ничего не нашли</p> : null}
        {items.map((event) => (
          <a key={event.id} href={`/events/${event.slug}`} className="block rounded-xl2 bg-pine/70 p-3">
            <p className="font-medium">{event.title}</p>
            <p className="text-xs text-ivory/75">{event.occurrences[0] ? new Date(event.occurrences[0].startsAt).toLocaleString("ru-RU") : "Без даты"}</p>
          </a>
        ))}
      </section>
    </main>
  );
}