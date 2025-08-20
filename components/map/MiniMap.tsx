// components/map/MiniMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabaseClient";
import { bindThemeToMap, getInitialMapStyle } from "./useMapTheme";
import { useLocation } from "./useLocation";
import Link from "next/link";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type Ev = {
  id: string;
  title: string;
  start_at: string;
  lat: number;
  lng: number;
  is_free?: boolean | null;
  image_url?: string | null;
  venue_name?: string | null;
  event_type?: string | null;
  age_restriction?: string | null;
};

interface MiniMapProps {
  className?: string;
  showFullMapButton?: boolean;
}

export default function MiniMap({ className = "", showFullMapButton = true }: MiniMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [events, setEvents] = useState<Ev[]>([]);
  const { location, isLoading, error } = useLocation();

  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: getInitialMapStyle(),
      center: [location.lng, location.lat],
      zoom: 10,
    });
    mapRef.current = map;

    const off = bindThemeToMap(map); // live theme switching
    return () => {
      off?.();
      map.remove();
      mapRef.current = null;
    };
  }, [location]);

  useEffect(() => {
    const load = async () => {
      const now = new Date().toISOString();
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);

      const { data, error } = await supabase
        .from("events")
        .select("id,title,start_at,lat,lng,is_free,image_url,venue_name,event_type,age_restriction")
        .eq("status", "approved")
        .filter("lat", "not.is", null)
        .filter("lng", "not.is", null)
        .gte("start_at", now)
        .lte("start_at", weekAhead.toISOString())
        .order("start_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error(error);
        return;
      }

      setEvents(
        (data ?? []).map((r) => ({
          ...r,
          lat: Number(r.lat),
          lng: Number(r.lng),
        }))
      );
    };
    load();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const bounds = new mapboxgl.LngLatBounds();

    events.forEach((ev) => {
const pin = makePin(ev.is_free);

const popupNode = document.createElement("div");
popupNode.innerHTML = popupHtml(ev);
const popup = new mapboxgl.Popup({ offset: 12, closeButton: true }).setDOMContent(popupNode);

const marker = new mapboxgl.Marker({ element: pin })
  .setLngLat([ev.lng!, ev.lat!])
  .setPopup(popup)
  .addTo(map);

// click-to-focus on the SVG pin itself
marker.getElement().addEventListener("click", () => {
  popup.addTo(map);
  map.flyTo({ center: [ev.lng!, ev.lat!], zoom: Math.max(map.getZoom(), 13) });
});

markersRef.current.set(ev.id, marker);
bounds.extend([ev.lng!, ev.lat!]);

    });

    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 40, maxZoom: 12 });
  }, [events]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div ref={mapEl} className="w-full h-full" />
      {showFullMapButton && (
        <Link
          href="/map"
          className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base shadow
                     token-border
                     bg-[rgb(var(--panel))]/80 backdrop-blur
                     hover:bg-[rgb(var(--panel))] transition-all duration-200 hover:scale-105"
        >
          View Full Map
        </Link>
      )}
    </div>
  );
}

// --- paste this ABOVE popupHtml() ---
function makePin(isFree?: boolean | null) {
  const el = document.createElement("div");
  el.innerHTML = `
    <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 36c5.5-8.6 12-13.2 12-21A12 12 0 1 0 1 15c0 7.8 6.5 12.4 12 21z" fill="${
        isFree ? "#22c55e" : "#f59e0b"
      }"/>
      <circle cx="13" cy="15" r="4.5" fill="white"/>
    </svg>`;
  el.style.width = "26px";
  el.style.height = "36px";
  el.style.cursor = "pointer";
  el.style.transform = "translateY(-6px)";
  return el;
}

function popupHtml(ev: Ev) {
  const img = ev.image_url
    ? `<img src="${escapeHtml(ev.image_url)}" alt="" class="w-full h-28 object-cover rounded-t-xl">`
    : "";
  const badge = ev.is_free
    ? `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-green-50 border-green-200 text-green-700">Free</span>`
    : `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-amber-50 border-amber-200 text-amber-700">Paid</span>`;

  const eventTypeInfo = ev.event_type ? `<div class="text-xs text-[rgb(var(--muted))] mt-1">${escapeHtml(ev.event_type)}</div>` : "";
  const ageInfo = ev.age_restriction && ev.age_restriction !== "All Ages" ? `<div class="text-xs text-[rgb(var(--muted))] mt-1">Age: ${escapeHtml(ev.age_restriction)}</div>` : "";

  return `
    <div class="overflow-hidden rounded-xl bg-[rgb(var(--panel))] text-[rgb(var(--text))]">
      ${img}
      <div class="p-3">
        <div class="flex items-center justify-between gap-2">
          <div class="text-sm font-semibold">${escapeHtml(ev.title)}</div>
          ${badge}
        </div>
        <div class="text-xs text-[rgb(var(--muted))] mt-1">${fmt(ev.start_at)}</div>
        ${eventTypeInfo}
        ${ageInfo}
        <div class="mt-2 flex items-center gap-3">
          <a class="text-blue-400 underline text-xs" href="/e/${ev.id}">Details</a>
          <a class="text-blue-400 underline text-xs" target="_blank" rel="noreferrer" href="https://www.google.com/maps?q=${ev.lat},${ev.lng}">Directions</a>
        </div>
      </div>
    </div>
  `;
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]!));
}
