"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    if (res.ok) {
      setUnauthorized(false);
      setItems(await res.json());
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (unauthorized) {
    return (
      <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Войдите в профиль, чтобы видеть уведомления.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <button onClick={() => fetch("/api/notifications/read", { method: "POST" }).then(load)} className="rounded-xl2 bg-terracotta px-3 py-2 text-xs">
          Прочитать все
        </button>
      </div>
      <section className="space-y-2">
        {items.length === 0 ? <p className="rounded-xl2 bg-pine/60 p-4 text-sm">Ничего не нашли</p> : null}
        {items.map((item) => (
          <article key={item.id} className={`rounded-xl2 p-3 ${item.isRead ? "bg-pine/40" : "bg-pine/80"}`}>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-ivory/80">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
