"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  title: string;
  endpoint: string;
  fields: string[];
};

export function CrudList({ title, endpoint, fields }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="space-y-2 rounded-xl3 bg-pine/70 p-4">
        {fields.map((field) => (
          <input
            key={field}
            value={form[field] ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            placeholder={field}
            className="w-full rounded-xl2 bg-bg px-3 py-2"
          />
        ))}
        <button
          onClick={() =>
            fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form)
            }).then(load)
          }
          className="rounded-xl2 bg-terracotta px-4 py-2 text-sm"
        >
          Добавить
        </button>
      </div>
      <section className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl2 bg-pine/70 p-3">
            <pre className="overflow-auto text-xs">{JSON.stringify(item, null, 2)}</pre>
            <button onClick={() => fetch(`${endpoint}/${item.id}`, { method: "DELETE" }).then(load)} className="mt-2 rounded-xl2 bg-bg px-3 py-1 text-xs">
              Удалить
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}