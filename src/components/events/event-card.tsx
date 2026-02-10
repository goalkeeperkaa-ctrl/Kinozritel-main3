import Link from "next/link";
import { EventOccurrence, Event, Venue } from "@prisma/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type OccurrenceWithEvent = EventOccurrence & { event: Event & { venue: Venue } };

export function EventCard({ occurrence }: { occurrence: OccurrenceWithEvent }) {
  return (
    <article className="rounded-xl3 bg-pine/70 p-4 shadow-soft">
      <p className="text-xs uppercase text-ivory/70">{format(occurrence.startsAt, "d MMMM, HH:mm", { locale: ru })}</p>
      <h3 className="mt-1 text-lg font-semibold">{occurrence.event.title}</h3>
      <p className="text-sm text-ivory/80">{occurrence.event.venue.name}</p>
      <div className="mt-3 flex gap-2">
        <Link href={`/events/${occurrence.event.slug}`} className="rounded-full bg-terracotta px-4 py-2 text-xs font-medium">
          Подробнее
        </Link>
      </div>
    </article>
  );
}