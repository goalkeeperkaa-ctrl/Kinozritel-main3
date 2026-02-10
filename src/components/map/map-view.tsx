"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type EventPoint = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  venue: { name: string; lat: number; lng: number };
};

export function MapView() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<EventPoint[]>([]);
  const [preview, setPreview] = useState<EventPoint | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [49.1064, 55.7961],
      zoom: 11
    });

    map.on("load", () => {
      map.addSource("events", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterRadius: 40
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "events",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#D1411C",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 26],
          "circle-opacity": 0.9
        }
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "events",
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}", "text-size": 12 }
      });

      map.addLayer({
        id: "unclustered",
        type: "circle",
        source: "events",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#EFEDEA",
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#213834"
        }
      });

      map.on("click", "unclustered", (e) => {
        const id = String(e.features?.[0]?.properties?.id ?? "");
        if (!id) return;
        const event = itemsRef.current.find((it) => it.id === id);
        if (event) setPreview(event);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const fetchByBounds = () => {
      const b = map.getBounds();
      if (!b) return;

      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(",");
      fetch(`/api/events?bbox=${bbox}&limit=60`)
        .then((r) => r.json())
        .then((data: { items?: EventPoint[] }) => {
          const nextItems = data.items ?? [];
          itemsRef.current = nextItems;

          const source = map.getSource("events") as mapboxgl.GeoJSONSource | undefined;
          if (!source) return;

          source.setData({
            type: "FeatureCollection",
            features: nextItems.map((it) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [it.venue.lng, it.venue.lat] },
              properties: { id: it.id }
            }))
          });
        })
        .catch(() => undefined);
    };

    fetchByBounds();
    map.on("moveend", fetchByBounds);
    return () => { map.off("moveend", fetchByBounds); };
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <div ref={containerRef} className="h-full w-full" />
      {preview ? (
        <div className="absolute bottom-20 left-4 right-4 rounded-xl3 bg-pine/95 p-3 shadow-soft">
          <p className="text-sm font-semibold">{preview.title}</p>
          <p className="text-xs text-ivory/80">{preview.venue.name}</p>
          <a href={`/events/${preview.slug}`} className="mt-2 inline-block rounded-full bg-terracotta px-3 py-1 text-xs">РџРѕРґСЂРѕР±РЅРµРµ</a>
        </div>
      ) : null}
    </div>
  );
}