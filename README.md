# Aidagis

Aidagis — MVP мобильного веб-приложения для поиска городских событий.

Стек:
- Next.js (App Router) + TypeScript
- TailwindCSS
- Prisma + Postgres
- NextAuth (email magic link через SMTP)
- Mapbox GL JS
- Route Handlers (`app/api/**/route.ts`)

## Основные функции

Пользователь:
- Выбор города (локально + в профиле)
- Лента событий с фильтрами
- Карта с маркерами и загрузкой по `bbox`
- Календарь по дате
- Поиск + история поиска (последние 10)
- Избранное
- «Иду»
- Детальная страница события (галерея, расписание, площадка)
- Центр уведомлений
- Профиль пользователя

Админ:
- CRUD городов, категорий, площадок, событий
- Управление расписанием (`event_occurrences`)
- Подготовленный endpoint для подписи загрузки в Cloudinary
- RBAC-защита admin API и admin страниц

## Быстрый старт

1. Установка зависимостей:
```bash
npm install
```

2. Создание `.env`:
```bash
cp .env.example .env
```

3. Генерация Prisma Client:
```bash
npm run prisma:generate
```

4. Миграции и сиды:
```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Запуск:
```bash
npm run dev
```

6. Production-сборка:
```bash
npm run build
```

## Переменные окружения

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `EMAIL_FROM`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `MAPBOX_TOKEN`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Примечание по карте:
- На клиенте используется `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Значение `MAPBOX_TOKEN` можно держать как серверный токен для будущих серверных задач.

## Деплой на Vercel

1. Импортировать репозиторий в Vercel.
2. Добавить все env vars в Project Settings.
3. Настроить Postgres (`DATABASE_URL`).
4. Build Command: `npm run build`
5. Install Command: `npm install`
6. После первого деплоя выполнить миграции в окружении прода:
```bash
npm run prisma:deploy
```

## Структура

- `app/` — страницы и API Route Handlers
- `app/admin/*` — админ-интерфейс
- `src/components/*` — UI и доменные компоненты
- `src/lib/*` — auth/db/helpers
- `src/theme/*` — дизайн-токены Aidagis
- `prisma/schema.prisma` — схема БД
- `prisma/seed.ts` — демо-данные (2 города, 30+ событий)