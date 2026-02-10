"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCitySelection } from "@/lib/use-city-selection";

const STORAGE_KEY = "aidagis-city-id";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { cities } = useCitySelection();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then(setProfile);
    }
  }, [status]);

  if (status === "loading") {
    return <main className="p-4">Загрузка...</main>;
  }

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-sm text-ivory/80">Войдите по email magic link</p>
        <div className="flex gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="flex-1 rounded-xl2 bg-pine px-3 py-2" />
          <button onClick={() => signIn("nodemailer", { email, callbackUrl: "/profile" })} className="rounded-xl2 bg-terracotta px-4">
            Войти
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">Профиль</h1>
      <div className="space-y-2 rounded-xl3 bg-pine/70 p-4">
        <input value={profile?.name ?? ""} onChange={(e) => setProfile((p: any) => ({ ...p, name: e.target.value }))} placeholder="Имя" className="w-full rounded-xl2 bg-bg px-3 py-2" />
        <input type="date" value={profile?.birthDate ? new Date(profile.birthDate).toISOString().slice(0, 10) : ""} onChange={(e) => setProfile((p: any) => ({ ...p, birthDate: e.target.value }))} className="w-full rounded-xl2 bg-bg px-3 py-2" />

        <select value={profile?.cityId ?? ""} onChange={(e) => setProfile((p: any) => ({ ...p, cityId: e.target.value }))} className="w-full rounded-xl2 bg-bg px-3 py-2">
          <option value="">Город</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(profile?.notificationsEvents)} onChange={(e) => setProfile((p: any) => ({ ...p, notificationsEvents: e.target.checked }))} />
          События
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(profile?.notificationsNews)} onChange={(e) => setProfile((p: any) => ({ ...p, notificationsNews: e.target.checked }))} />
          Новости
        </label>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
              });
              if (res.ok) {
                setMessage("Профиль сохранен");
                if (profile?.cityId) {
                  localStorage.setItem(STORAGE_KEY, profile.cityId);
                }
              } else {
                setMessage("Ошибка сохранения");
              }
            }}
            className="rounded-xl2 bg-terracotta px-4 py-2 text-sm"
          >
            Сохранить
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-xl2 bg-bg px-4 py-2 text-sm">
            Выйти
          </button>
        </div>

        {message ? <p className="text-xs text-ivory/80">{message}</p> : null}
      </div>

      {session.user.role === "ADMIN" ? (
        <Link href="/admin" className="inline-block rounded-xl2 bg-terracotta px-4 py-2 text-sm">
          Админ-панель
        </Link>
      ) : null}
    </main>
  );
}
