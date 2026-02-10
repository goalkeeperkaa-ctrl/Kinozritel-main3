"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useCitySelection } from "@/lib/use-city-selection";

export default function SearchPage() {
  const { cities, cityId, setCityId } = useCitySelection();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    const res = await fetch("/api/search-history");
    if (res.ok) setHistory(await res.json());
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;

    const params = new URLSearchParams({ q: q.trim(), limit: "30" });
    if (cityId) params.set("cityId", cityId);

    setLoading(true);
    const res = await fetch(`/api/events?${params.toString()}`);
    const data = await res.json();
    setItems(data.items ?? []);

    const storeRes = await fetch("/api/search-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q.trim() })
    });

    if (storeRes.ok) {
      await loadHistory();
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">Поиск</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1fr,auto]">
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="rounded-xl2 bg-pine px-3 py-2">
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} className="rounded-xl2 bg-pine px-3 py-2" placeholder="Название, место, описание" />
        <button className="rounded-xl2 bg-terracotta px-4 py-2">Найти</button>
      </form>

      <section className="rounded-xl2 bg-pine/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">История</h2>
          <button onClick={() => fetch("/api/search-history", { method: "DELETE" }).then(loadHistory)} className="text-xs text-ivory/75">
            Очистить
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {history.map((h) => (
            <button key={h.id} onClick={() => setQ(h.query)} className="rounded-full bg-bg/70 px-3 py-1 text-xs">
              {h.query}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        {loading ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Загрузка...</p> : null}
        {!loading && items.length === 0 ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Ничего не нашли</p> : null}
        {items.map((event) => (
          <Link key={event.id} href={`/events/${event.slug}`} className="block rounded-xl2 bg-pine/70 p-3">
            <p className="font-medium">{event.title}</p>
            <p className="text-xs text-ivory/80">{event.venue.name}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
