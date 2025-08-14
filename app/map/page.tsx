// ==============================
// FILE: app/map/page.tsx
// (adds date-range filtering + Free toggle; keeps dedupe + badges)
// ==============================
"use client";
import {
    bindThemeToMap,
    getInitialMapStyle
} from "@/components/map/useMapTheme";
import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
    supabase
} from "@/lib/supabaseClient";
import {
    FilterBar,
    Range
} from "@/components/map/FilterBar";
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
type Ev = {
    id: string;
    title: string;
    start_at: string;
    venue_name: string | null;
    lat: number | null;
    lng: number | null;
    image_url: string | null;
    status: "approved" | "pending" | "rejected" | string;
    is_free ? : boolean | null;
    price_cents ? : number | null;
};
export default function MapPage() {
    const mapEl = useRef < HTMLDivElement > (null);
    const mapRef = useRef < mapboxgl.Map | null > (null);
    const markersRef = useRef < Map < string,
        mapboxgl.Marker >> (new Map());
    const [events, setEvents] = useState < Ev[] > ([]);
    const [range, setRange] = useState < Range > ("all");
    const [onlyFree, setOnlyFree] = useState(false);
    const [startDate, setStartDate] = useState < string | null > (null);
    const [endDate, setEndDate] = useState < string | null > (null);
    const [selectedId, setSelectedId] = useState < string | null > (null);
    // Deduplicate rows (prevents dupes from re-mounts)
    const uniqueEvents = useMemo(
        () => Array.from(new Map(events.map((e) => [e.id, e])).values()),
        [events]);
    // Init map
    useEffect(() => {
        if (mapRef.current || !mapEl.current) return;
        const map = new mapboxgl.Map({
            container: mapEl.current,
            style: getInitialMapStyle(),
            center: [-122.4579, 37.7699],
            zoom: 11,
        });
        mapRef.current = map;
        const off = bindThemeToMap(map);
        return () => {
            off?.();
            map.remove();
            mapRef.current = null;
        };
    }, []);
    // Fetch with filters
    useEffect(() => {
        const load = async () => {
            try {
                let q = supabase.from("events").select("id,title,start_at,venue_name,lat,lng,image_url,status,price_cents,is_free").eq("status", "approved").filter("lat", "not.is", null).filter("lng", "not.is", null).order("start_at", {
                    ascending: true
                }).limit(500);
                const now = new Date();
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(now);
                endOfDay.setHours(23, 59, 59, 999);
                const in7 = new Date(now);
                in7.setDate(in7.getDate() + 7);
                const in30 = new Date(now);
                in30.setDate(in30.getDate() + 30);
                // Date constraints
                if (range !== "all" && range !== "custom") {
                    q = q.gte("start_at", startOfDay.toISOString());
                    if (range === "today") q = q.lte("start_at", endOfDay.toISOString());
                    if (range === "week") q = q.lte("start_at", in7.toISOString());
                    if (range === "30") q = q.lte("start_at", in30.toISOString());
                }
                if (range === "custom" && startDate && endDate) {
                    const startIso = new Date(startDate + "T00:00:00").toISOString();
                    const endIso = new Date(endDate + "T23:59:59").toISOString();
                    q = q.gte("start_at", startIso).lte("start_at", endIso);
                }
                if (onlyFree) q = q.eq("is_free", true);
                const {
                    data,
                    error,
                    status
                } = await q;
                if (error) {
                    console.error("Supabase error", {
                        status,
                        message: error.message,
                        details: error.details
                    });
                    setEvents([]);
                    return;
                }
                const rows: Ev[] = (data ?? []).map((r: any) => ({
                    ...r,
                    lat: r.lat != null ? Number(r.lat) : null,
                    lng: r.lng != null ? Number(r.lng) : null,
                    image_url: r.image_url ?? null,
                    venue_name: r.venue_name ?? null,
                })) || [];
                setEvents(rows);
            } catch (e) {
                console.error("Fetch crash", e);
                setEvents([]);
            }
        };
        load();
    }, [range, onlyFree, startDate, endDate]);
    // Markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        // Clear old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current.clear();
        const bounds = new mapboxgl.LngLatBounds();
        uniqueEvents.forEach((ev) => {
            if (ev.lat == null || ev.lng == null) return;
            const el = document.createElement("div");
            el.className = "rounded-full bg-white border shadow-sm text-[10px] px-2 py-1";
            el.style.cursor = "pointer";
            el.textContent = "•";
            const pin = makePin(ev.is_free);
            const popupNode = document.createElement("div");
            popupNode.innerHTML = popupHtml(ev);
            const popup = new mapboxgl.Popup({
                offset: 12,
                closeButton: true
            }).setDOMContent(popupNode);
            const marker = new mapboxgl.Marker({
                element: pin
            }).setLngLat([ev.lng!, ev.lat!]).setPopup(popup).addTo(map);
            // click-to-focus on the SVG pin itself
            marker.getElement().addEventListener("click", () => {
                setSelectedId(ev.id);
                popup.addTo(map);
                map.flyTo({
                    center: [ev.lng!, ev.lat!],
                    zoom: Math.max(map.getZoom(), 13)
                });
            });
            markersRef.current.set(ev.id, marker);
            bounds.extend([ev.lng!, ev.lat!]);
        });
        if (!bounds.isEmpty()) map.fitBounds(bounds, {
            padding: 60,
            maxZoom: 13
        });
    }, [uniqueEvents]);
    const selected = useMemo(
        () => uniqueEvents.find((e) => e.id === selectedId) || null,
        [uniqueEvents, selectedId]);
    return (<div className="min-h-[70vh]">
      <FilterBar
        range={range}
        setRange={setRange}
        onlyFree={onlyFree}
        setOnlyFree={setOnlyFree}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onApplyCustom={() => setRange("custom")}
      />

      <div className="grid md:grid-cols-[2fr,1fr] gap-6 max-w-6xl mx-auto px-4 py-6">
        <div className="relative w-full h-[70vh] rounded-2xl border border-[color:var(--border-color)] overflow-hidden">
          <div ref={mapEl} className="w-full h-full" />
        </div>

        <aside className="space-y-3">
          <div className="text-sm text-[rgb(var(--muted))]">{uniqueEvents.length} upcoming at this location</div>


          <div className="grid gap-3">
            {uniqueEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => {
                  setSelectedId(ev.id);
                  const m = markersRef.current.get(ev.id);
                  if (m && mapRef.current) {
                    m.togglePopup();
                    mapRef.current.flyTo({ center: [ev.lng!, ev.lat!], zoom: 13 });
                  }
                }}
                className={`text-left rounded-lg border border-[color:var(--border-color)] p-3 bg-[rgb(var(--panel))] hover:border-[color:var(--border-color)] ${selectedId===ev.id ? "outline outline-1 outline-blue-500" : ""}`}

              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{ev.title}</div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      ev.is_free
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    {ev.is_free ? "Free" : "Paid"}
                  </span>
                </div>
                <div className="text-xs text-[rgb(var(--muted))]">
                  {fmt(ev.start_at)}
                  {ev.venue_name ? " · " + ev.venue_name : ""}
                </div>
              </button>
            ))}

            {uniqueEvents.length === 0 && (
              <div className="rounded-lg border border-[color:var(--border-color)] p-3 bg-[rgb(var(--panel))] text-sm text-[rgb(var(--text))]">
                No events match these filters.
              </div>
            )}
          </div>

          {selected && (
            <div className="rounded-lg border border-[color:var(--border-color)] p-3 bg-[rgb(var(--panel))]">
              <div className="text-sm font-semibold">{selected.title}</div>
              <div className="text-xs text-zinc-600 mt-1">
                {fmt(selected.start_at)}
                {selected.venue_name ? " · " + selected.venue_name : ""}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>);
}
// --- paste this ABOVE popupHtml() ---
function makePin(isFree ? : boolean | null) {
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
// popup template (drop this at the bottom of the map file)
function popupHtml(ev: {
    id: string;title: string;start_at: string;lat ? : number;lng ? : number;image_url ? : string | null;is_free ? : boolean | null;venue_name ? : string | null;
}) {
    const img = ev.image_url ? `<img src="${escapeHtml(ev.image_url)}" alt="" class="w-full h-28 object-cover rounded-t-xl">` : "";
    const badge = ev.is_free ? `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-green-50 border-green-200 text-green-700">Free</span>` : `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-amber-50 border-amber-200 text-amber-700">Paid</span>`;
    return `
    <div class="overflow-hidden rounded-xl bg-[rgb(var(--panel))] text-[rgb(var(--text))]">
      ${img}
      <div class="p-3">
        <div class="flex items-center justify-between gap-2">
          <div class="text-sm font-semibold">${escapeHtml(ev.title)}</div>
          ${badge}
        </div>
        <div class="text-xs text-[rgb(var(--muted))] mt-1">${fmt(ev.start_at)}${ev.venue_name ? " · " + escapeHtml(ev.venue_name) : ""}</div>
        <div class="mt-2 flex items-center gap-3">
          <a class="text-blue-400 underline text-xs" href="/e/${ev.id}">Details</a>
          ${ev.lat && ev.lng ? `<a class="text-blue-400 underline text-xs" target="_blank" rel="noreferrer" href="https://www.google.com/maps?q=${ev.lat},${ev.lng}">Directions</a>` : ""}
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
        minute: "2-digit"
    });
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    } [c] !));
}