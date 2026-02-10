import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const cityData = [
  { slug: "kazan", name: "Казань" },
  { slug: "almetevsk", name: "Альметьевск" }
];

const categoryData = [
  { slug: "music", name: "Музыка" },
  { slug: "theatre", name: "Театр" },
  { slug: "exhibition", name: "Выставки" },
  { slug: "family", name: "Семейные" },
  { slug: "lecture", name: "Лекции" },
  { slug: "festival", name: "Фестивали" }
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.going.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.eventMedia.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.eventOccurrence.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();

  const cities = await Promise.all(cityData.map((c) => prisma.city.create({ data: c })));
  const categories = await Promise.all(categoryData.map((c) => prisma.category.create({ data: c })));

  const [kazan, almet] = cities;

  const kazanVenues = await Promise.all([
    prisma.venue.create({ data: { cityId: kazan.id, name: "Культурный центр Смена", address: "ул. Бурхана Шахиди, 7", lat: 55.7902, lng: 49.1139 } }),
    prisma.venue.create({ data: { cityId: kazan.id, name: "Национальная библиотека РТ", address: "ул. Пушкина, 86", lat: 55.7871, lng: 49.1264 } }),
    prisma.venue.create({ data: { cityId: kazan.id, name: "Кремлевская набережная", address: "Федосеевская, 1", lat: 55.7987, lng: 49.1045 } })
  ]);

  const almetVenues = await Promise.all([
    prisma.venue.create({ data: { cityId: almet.id, name: "ДК Нефтьче", address: "ул. Ленина, 98", lat: 54.9022, lng: 52.2971 } }),
    prisma.venue.create({ data: { cityId: almet.id, name: "Парк Здоровье", address: "ул. Белоглазова, 131", lat: 54.9005, lng: 52.3089 } })
  ]);

  const templates = [
    "Этно-джаз вечер",
    "Театральная премьера",
    "Выставка ремесел",
    "Семейный уикенд",
    "Лекторий о традициях",
    "Фестиваль культуры"
  ];

  const allVenues = [...kazanVenues, ...almetVenues];

  const events = [];
  for (let i = 0; i < 34; i += 1) {
    const venue = allVenues[i % allVenues.length];
    const cityId = venue.cityId;
    const title = `${templates[i % templates.length]} ${i + 1}`;
    const event = await prisma.event.create({
      data: {
        cityId,
        venueId: venue.id,
        slug: slugify(title),
        title,
        description: "Локальное культурное событие с живой программой, площадками и мастер-классами.",
        coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        priceFrom: 300 + (i % 5) * 200,
        isPublished: true
      }
    });

    const categoryA = categories[i % categories.length];
    const categoryB = categories[(i + 2) % categories.length];

    await prisma.eventCategory.createMany({
      data: [
        { eventId: event.id, categoryId: categoryA.id },
        { eventId: event.id, categoryId: categoryB.id }
      ],
      skipDuplicates: true
    });

    await prisma.eventMedia.createMany({
      data: [
        { eventId: event.id, url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80", sortOrder: 1 },
        { eventId: event.id, url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80", sortOrder: 2 }
      ]
    });

    for (let d = 1; d <= 4; d += 1) {
      const start = new Date();
      start.setDate(start.getDate() + d + (i % 7));
      start.setHours(11 + ((i + d) % 9), 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 2);
      await prisma.eventOccurrence.create({
        data: {
          eventId: event.id,
          startsAt: start,
          endsAt: end
        }
      });
    }

    events.push(event);
  }

  const admin = await prisma.user.create({
    data: {
      name: "Админ Aidagis",
      email: "admin@aidagis.local",
      role: Role.ADMIN,
      cityId: kazan.id
    }
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Гость",
      email: "user@aidagis.local",
      role: Role.USER,
      cityId: kazan.id
    }
  });

  await prisma.favorite.createMany({
    data: events.slice(0, 5).map((e) => ({ userId: demoUser.id, eventId: e.id }))
  });

  await prisma.going.createMany({
    data: events.slice(3, 8).map((e) => ({ userId: demoUser.id, eventId: e.id }))
  });

  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, title: "Новое событие в Казани", body: "Добавлен свежий этно-джаз вечер" },
      { userId: demoUser.id, title: "Напоминание", body: "Сегодня в 19:00 ваше событие" }
    ]
  });

  console.log("Seed complete", { cities: cities.length, categories: categories.length, events: events.length, admin: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });