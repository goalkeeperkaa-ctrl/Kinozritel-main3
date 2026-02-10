"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  title: string;
  endpoint: string;
  fields: string[];
};

function normalizeValue(field: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (field.endsWith("Ids")) {
    return trimmed.split(",").map((x) => x.trim()).filter(Boolean);
  }

  if (field === "lat" || field === "lng" || field === "priceFrom") {
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  }

  return trimmed;
}

export function CrudList({ title, endpoint, fields }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const payload = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const field of fields) {
      const v = normalizeValue(field, form[field] ?? "");
      if (v !== undefined) out[field] = v;
    }
    return out;
  }, [fields, form]);

  const load = useCallback(async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `${endpoint}/${editingId}` : endpoint;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      setMessage("Ошибка сохранения");
      return;
    }

    setMessage(editingId ? "Обновлено" : "Добавлено");
    setEditingId(null);
    setForm({});
    await load();
  }

  async function remove(id: string) {
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Удалено");
      await load();
    }
  }

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

        <div className="flex gap-2">
          <button onClick={submit} className="rounded-xl2 bg-terracotta px-4 py-2 text-sm">
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId ? (
            <button
              onClick={() => {
                setEditingId(null);
                setForm({});
              }}
              className="rounded-xl2 bg-bg px-4 py-2 text-sm"
            >
              Отмена
            </button>
          ) : null}
        </div>

        {message ? <p className="text-xs text-ivory/80">{message}</p> : null}
      </div>

      <section className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className="space-y-2 rounded-xl2 bg-pine/70 p-3">
            <pre className="overflow-auto text-xs">{JSON.stringify(item, null, 2)}</pre>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const next: Record<string, string> = {};
                  for (const field of fields) {
                    const value = item[field];
                    if (Array.isArray(value)) {
                      next[field] = value.join(",");
                    } else if (value == null) {
                      next[field] = "";
                    } else {
                      next[field] = String(value);
                    }
                  }
                  setEditingId(item.id);
                  setForm(next);
                }}
                className="rounded-xl2 bg-bg px-3 py-1 text-xs"
              >
                Редактировать
              </button>
              <button onClick={() => remove(item.id)} className="rounded-xl2 bg-bg px-3 py-1 text-xs">
                Удалить
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
