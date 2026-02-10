"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCitySelection } from "@/lib/use-city-selection";

export default function CalendarPage() {
  const { cities, cityId, setCityId, ready } = useCitySelection();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    params.set("dateFrom", `${date}T00:00:00.000Z`);
    params.set("dateTo", `${date}T23:59:59.999Z`);
    params.set("limit", "50");
    if (cityId) params.set("cityId", cityId);

    setLoading(true);
    fetch(`/api/events?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [cityId, date, ready]);

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">Календарь</h1>

      <div className="grid grid-cols-2 gap-2">
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="rounded-xl2 bg-pine px-3 py-2">
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl2 bg-pine px-3 py-2" />
      </div>

      <section className="space-y-2">
        {loading ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Загрузка...</p> : null}
        {!loading && items.length === 0 ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Ничего не нашли</p> : null}
        {items.map((event) => (
          <Link key={event.id} href={`/events/${event.slug}`} className="block rounded-xl2 bg-pine/70 p-3">
            <p className="font-medium">{event.title}</p>
            <p className="text-xs text-ivory/75">{event.occurrences[0] ? new Date(event.occurrences[0].startsAt).toLocaleString("ru-RU") : "Без даты"}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
