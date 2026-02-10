"use client";

export function EventActions({ eventId }: { eventId: string }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => fetch(`/api/going/${eventId}`, { method: "POST" })} className="rounded-full bg-bg px-3 py-2 text-xs">Иду</button>
      <button onClick={() => fetch(`/api/favorites/${eventId}`, { method: "POST" })} className="rounded-full bg-bg px-3 py-2 text-xs">В избранное</button>
    </div>
  );
}