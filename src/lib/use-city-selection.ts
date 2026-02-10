"use client";

import { useEffect, useMemo, useState } from "react";

type City = { id: string; name: string; slug?: string };

const STORAGE_KEY = "aidagis-city-id";

export function useCitySelection() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityIdState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/cities")
      .then((r) => r.json())
      .then((list: City[]) => {
        if (!active) return;
        setCities(list);

        const saved = localStorage.getItem(STORAGE_KEY);
        const savedExists = saved && list.some((c) => c.id === saved);
        const kazan = list.find((c) => c.name.toLowerCase().includes("казан"));

        const initial = savedExists ? saved! : kazan?.id ?? list[0]?.id ?? "";
        setCityIdState(initial);
        if (initial) localStorage.setItem(STORAGE_KEY, initial);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedCity = useMemo(() => cities.find((c) => c.id === cityId) ?? null, [cities, cityId]);

  function setCityId(next: string) {
    setCityIdState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { cities, cityId, setCityId, selectedCity, ready };
}
