"use client";

import { useState } from "react";

type Props = {
  eventId: string;
  initialFavorite?: boolean;
  initialGoing?: boolean;
  onChange?: (next: { favorite: boolean; going: boolean }) => void;
};

export function EventActions({ eventId, initialFavorite = false, initialGoing = false, onChange }: Props) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [going, setGoing] = useState(initialGoing);
  const [loading, setLoading] = useState<"favorite" | "going" | null>(null);

  async function toggleFavorite() {
    setLoading("favorite");
    const next = !favorite;
    const res = await fetch(`/api/favorites/${eventId}`, { method: next ? "POST" : "DELETE" });

    if (res.status === 401) {
      window.location.href = "/profile";
      return;
    }

    if (res.ok) {
      setFavorite(next);
      onChange?.({ favorite: next, going });
    }
    setLoading(null);
  }

  async function toggleGoing() {
    setLoading("going");
    const next = !going;
    const res = await fetch(`/api/going/${eventId}`, { method: next ? "POST" : "DELETE" });

    if (res.status === 401) {
      window.location.href = "/profile";
      return;
    }

    if (res.ok) {
      setGoing(next);
      onChange?.({ favorite, going: next });
    }
    setLoading(null);
  }

  return (
    <div className="flex gap-2">
      <button onClick={toggleGoing} disabled={loading !== null} className={`rounded-full px-3 py-2 text-xs ${going ? "bg-terracotta" : "bg-bg"}`}>
        {loading === "going" ? "..." : going ? "Вы идете" : "Иду"}
      </button>
      <button onClick={toggleFavorite} disabled={loading !== null} className={`rounded-full px-3 py-2 text-xs ${favorite ? "bg-terracotta" : "bg-bg"}`}>
        {loading === "favorite" ? "..." : favorite ? "В избранном" : "Избранное"}
      </button>
    </div>
  );
}
