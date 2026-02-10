"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type City = { id: string; name: string };
type Category = { id: string; name: string };
type EventItem = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  priceFrom: number | null;
  venue: { name: string };
  occurrences: { id: string; startsAt: string }[];
  _count: { favorites: number; going: number };
};

export function FeedClient() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cityId, setCityId] = useState("");
  const [q, setQ] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aidagis-city-id");
    if (saved) setCityId(saved);

    Promise.all([fetch("/api/cities"), fetch("/api/categories")])
      .then(async ([c, ct]) => {
        setCities(await c.json());
        setCategories(await ct.json());
      })
      .catch(() => undefined);
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (cityId) params.set("cityId", cityId);
    if (q.trim()) params.set("q", q.trim());
    if (timeSlot) params.set("timeSlot", timeSlot);
    if (dateFrom) {
      params.set("dateFrom", dateFrom);
      params.set("dateTo", `${dateFrom}T23:59:59.999Z`);
    }
    if (selectedCategories.length) params.set("categoryIds", selectedCategories.join(","));
    params.set("page", String(page));
    params.set("limit", "10");
    return params.toString();
  }, [cityId, q, timeSlot, dateFrom, selectedCategories, page]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setHasMore(Boolean(data.hasMore));
        setEvents((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
      })
      .finally(() => setLoading(false));
  }, [query, page]);

  useEffect(() => {
    setPage(1);
  }, [cityId, q, timeSlot, dateFrom, selectedCategories]);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col gap-4 px-4 pb-24 pt-4">
      <section className="ethnic-strip rounded-xl3 p-4">
        <h1 className="text-2xl font-bold">Aidagis</h1>
        <p className="text-sm text-ivory/80">События рядом с вами</p>
      </section>

      <section className="rounded-xl3 bg-pine/70 p-3">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              localStorage.setItem("aidagis-city-id", e.target.value);
            }}
            className="rounded-xl2 bg-bg px-3 py-2 text-sm"
          >
            <option value="">Город</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="rounded-xl2 bg-bg px-3 py-2 text-sm">
            <option value="">Время</option>
            <option value="morning">Утро</option>
            <option value="day">День</option>
            <option value="evening">Вечер</option>
            <option value="night">Ночь</option>
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск" className="rounded-xl2 bg-bg px-3 py-2 text-sm" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl2 bg-bg px-3 py-2 text-sm" />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs ${selectedCategories.includes(cat.id) ? "bg-terracotta" : "bg-bg/80"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {!loading && events.length === 0 ? <p className="rounded-xl3 bg-pine/50 p-4 text-sm">Ничего не нашли</p> : null}
        {events.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-xl3 bg-pine/70 shadow-soft">
            <div className="relative aspect-video bg-bg/50">
              {event.coverUrl ? (
                <Image src={event.coverUrl} alt={event.title} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
              ) : null}
            </div>
            <div className="space-y-2 p-4">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-ivory/80">{event.venue.name}</p>
              <p className="text-xs text-ivory/70">{event.occurrences[0] ? new Date(event.occurrences[0].startsAt).toLocaleString("ru-RU") : "Дата уточняется"}</p>
              <div className="flex items-center gap-2 text-xs">
                <button onClick={() => fetch(`/api/going/${event.id}`, { method: "POST" })} className="rounded-full bg-bg px-3 py-1">Иду</button>
                <button onClick={() => fetch(`/api/favorites/${event.id}`, { method: "POST" })} className="rounded-full bg-bg px-3 py-1">Избранное</button>
                <Link href={`/events/${event.slug}`} className="rounded-full bg-terracotta px-3 py-1">Открыть</Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {hasMore ? (
        <button disabled={loading} onClick={() => setPage((p) => p + 1)} className="rounded-xl2 bg-terracotta px-4 py-3 text-sm">
          {loading ? "Загрузка..." : "Показать еще"}
        </button>
      ) : null}
    </div>
  );
}