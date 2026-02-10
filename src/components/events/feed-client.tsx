"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EventActions } from "@/components/events/event-actions";
import { useCitySelection } from "@/lib/use-city-selection";

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

type StateMap = Record<string, { favorite: boolean; going: boolean }>;

export function FeedClient() {
  const { cities, cityId, setCityId, selectedCity, ready } = useCitySelection();
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [stateByEvent, setStateByEvent] = useState<StateMap>({});
  const [q, setQ] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (cityId) params.set("cityId", cityId);
    if (q.trim()) params.set("q", q.trim());
    if (timeSlot) params.set("timeSlot", timeSlot);
    if (dateFrom) {
      params.set("dateFrom", `${dateFrom}T00:00:00.000Z`);
      params.set("dateTo", `${dateFrom}T23:59:59.999Z`);
    }
    if (selectedCategories.length) params.set("categoryIds", selectedCategories.join(","));
    params.set("page", String(page));
    params.set("limit", "10");
    return params.toString();
  }, [cityId, q, timeSlot, dateFrom, selectedCategories, page]);

  useEffect(() => {
    if (!ready) return;

    setLoading(true);
    fetch(`/api/events?${query}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.items ?? [];
        setHasMore(Boolean(data.hasMore));
        setEvents((prev) => (page === 1 ? list : [...prev, ...list]));
      })
      .finally(() => setLoading(false));
  }, [query, page, ready]);

  useEffect(() => {
    if (!ready) return;
    setPage(1);
  }, [cityId, q, timeSlot, dateFrom, selectedCategories, ready]);

  useEffect(() => {
    if (events.length === 0) return;

    const ids = events.map((x) => x.id).join(",");
    fetch(`/api/events/states?eventIds=${ids}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const next: StateMap = {};
        const favorites = new Set<string>(data.favorites ?? []);
        const going = new Set<string>(data.going ?? []);

        for (const event of events) {
          next[event.id] = {
            favorite: favorites.has(event.id),
            going: going.has(event.id)
          };
        }

        setStateByEvent(next);
      })
      .catch(() => undefined);
  }, [events]);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col gap-4 px-4 pb-24 pt-4">
      <section className="ethnic-strip rounded-xl3 p-4">
        <h1 className="text-2xl font-bold">Aidagis</h1>
        <p className="text-sm text-ivory/80">Культурные события {selectedCity ? `в ${selectedCity.name}` : ""}</p>
      </section>

      <section className="rounded-xl3 bg-pine/70 p-3">
        <div className="grid grid-cols-2 gap-2">
          <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="rounded-xl2 bg-bg px-3 py-2 text-sm">
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="rounded-xl2 bg-bg px-3 py-2 text-sm">
            <option value="">Любое время</option>
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
        {loading && page === 1 ? <p className="rounded-xl3 bg-pine/50 p-4 text-sm">Загрузка...</p> : null}
        {!loading && events.length === 0 ? <p className="rounded-xl3 bg-pine/50 p-4 text-sm">Ничего не нашли</p> : null}

        {events.map((event) => {
          const state = stateByEvent[event.id] ?? { favorite: false, going: false };

          return (
            <article key={event.id} className="overflow-hidden rounded-xl3 bg-pine/70 shadow-soft">
              <div className="relative aspect-video bg-bg/50">
                {event.coverUrl ? (
                  <Image src={event.coverUrl} alt={event.title} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
                ) : null}
              </div>

              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-ivory/80">{event.venue.name}</p>
                <p className="text-xs text-ivory/70">
                  {event.occurrences[0] ? new Date(event.occurrences[0].startsAt).toLocaleString("ru-RU") : "Дата уточняется"}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <EventActions
                    eventId={event.id}
                    initialFavorite={state.favorite}
                    initialGoing={state.going}
                    onChange={(next) => {
                      setStateByEvent((prev) => ({ ...prev, [event.id]: next }));
                    }}
                  />

                  <Link href={`/events/${event.slug}`} className="rounded-full bg-terracotta px-3 py-2 text-xs">
                    Открыть
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {hasMore ? (
        <button disabled={loading} onClick={() => setPage((p) => p + 1)} className="rounded-xl2 bg-terracotta px-4 py-3 text-sm">
          {loading ? "Загрузка..." : "Показать еще"}
        </button>
      ) : null}
    </div>
  );
}
