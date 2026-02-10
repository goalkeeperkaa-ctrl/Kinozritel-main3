import Image from "next/image";
import { notFound } from "next/navigation";
import { EventActions } from "@/components/events/event-actions";
import { Gallery } from "@/components/events/gallery";
import { prisma } from "@/lib/prisma";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findFirst({
    where: { OR: [{ id: slug }, { slug }] },
    include: {
      venue: true,
      occurrences: { orderBy: { startsAt: "asc" } },
      media: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } }
    }
  });

  if (!event) return notFound();

  const gallery = [event.coverUrl, ...event.media.map((m) => m.url)].filter(Boolean) as string[];

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <div className="overflow-hidden rounded-xl3 bg-pine/80">
        {event.coverUrl ? (
          <Image src={event.coverUrl} alt={event.title} width={1600} height={900} className="aspect-video w-full object-cover" />
        ) : null}
        <div className="space-y-3 p-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-ivory/80">
            {event.venue.name} · {event.venue.address}
          </p>
          <p className="text-sm text-ivory/85">{event.description}</p>
          <div className="flex flex-wrap gap-2">
            {event.categories.map((cat) => (
              <span key={cat.categoryId} className="rounded-full bg-bg/70 px-3 py-1 text-xs">
                {cat.category.name}
              </span>
            ))}
          </div>
          <EventActions eventId={event.id} />
        </div>
      </div>

      <section className="rounded-xl3 bg-pine/70 p-4">
        <h2 className="mb-2 text-lg font-semibold">Расписание</h2>
        <div className="space-y-2">
          {event.occurrences.map((o) => (
            <p key={o.id} className="rounded-xl2 bg-bg/60 px-3 py-2 text-sm">
              {new Date(o.startsAt).toLocaleString("ru-RU")} - {new Date(o.endsAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-xl3 bg-pine/70 p-4">
        <h2 className="mb-2 text-lg font-semibold">Галерея</h2>
        <Gallery images={gallery} />
      </section>
    </main>
  );
}