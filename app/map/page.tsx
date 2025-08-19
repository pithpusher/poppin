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
import FilterBar, { Range } from "@/components/map/FilterBar";
import { useLocation } from "@/components/map/useLocation";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { tokens } from "@/components/tokens";
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
    is_free?: boolean | null;
    price_cents?: number | null;
    event_type?: string | null;
    age_restriction?: string | null;
};
export default function MapPage() {
    const mapEl = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const [events, setEvents] = useState<Ev[]>([]);
    const [range, setRange] = useState<Range>("all");
    const [onlyFree, setOnlyFree] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; formatted: string } | null>(null);
    const [eventTypes, setEventTypes] = useState<string[]>([]);
    const [ageRestriction, setAgeRestriction] = useState<string>("All Ages");
    const [searchTerm, setSearchTerm] = useState("");
    const { location, isLoading, error } = useLocation();

    // Handle map search functionality
    const handleMapSearch = async () => {
        if (!searchTerm.trim() || !mapRef.current) return;
        
        try {
            // Use Google Places API to search for the location
            const searchBox = new google.maps.places.SearchBox(searchTerm);
            
            // For now, we'll simulate a search by updating the search location
            // In a real implementation, you'd use Google Places API or similar
            const mockSearchResult = {
                lat: location.lat + (Math.random() - 0.5) * 0.1, // Small random offset
                lng: location.lng + (Math.random() - 0.5) * 0.1,
                formatted: searchTerm
            };
            
            setSearchLocation(mockSearchResult);
            
            // Update map center and zoom
            mapRef.current.flyTo({
                center: [mockSearchResult.lng, mockSearchResult.lat],
                zoom: 13
            });
            
            // Clear search term
            setSearchTerm("");
            
        } catch (error) {
            console.error('Search error:', error);
        }
    };
    // Handle URL search parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const lat = urlParams.get('lat');
        const lng = urlParams.get('lng');
        const query = urlParams.get('query');
        
        if (lat && lng && query) {
            setSearchLocation({
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                formatted: query
            });
        }
    }, []);
    // Deduplicate rows (prevents dupes from re-mounts)
    const uniqueEvents = useMemo(
        () => Array.from(new Map(events.map((e) => [e.id, e])).values()),
        [events]);
    // Init map
    useEffect(() => {
        if (mapRef.current || !mapEl.current) return;
        
        // Use search location if available, otherwise use user location
        const centerLocation = searchLocation || location;
        
        const map = new mapboxgl.Map({
            container: mapEl.current,
            style: getInitialMapStyle(),
            center: [centerLocation.lng, centerLocation.lat],
            zoom: 11,
            // Disable zooming on mobile
            scrollZoom: !('ontouchstart' in window),
            dragPan: true,
            dragRotate: false,
            keyboard: false,
            doubleClickZoom: !('ontouchstart' in window),
            touchZoomRotate: false,
            // Disable pinch zoom
            touchPitch: false,
            touchZoomRotate: false,
        });
        mapRef.current = map;
        const off = bindThemeToMap(map);
        return () => {
            off?.();
            map.remove();
            mapRef.current = null;
        };
    }, [location, searchLocation]);
    // Fetch with filters
    useEffect(() => {
        const load = async () => {
            try {
                let q = supabase.from("events").select("id,title,start_at,venue_name,lat,lng,image_url,status,price_cents,is_free,event_type,age_restriction").eq("status", "approved").filter("lat", "not.is", null).filter("lng", "not.is", null).order("start_at", {
                    ascending: true
                }).limit(500);
                
                const now = new Date();
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(now);
                endOfDay.setHours(23, 59, 59, 999);
                const in7 = new Date(now);
                in7.setDate(now.getDate() + 7);
                const in30 = new Date(now);
                in30.setDate(now.getDate() + 30);
                
                // Date constraints
                if (range !== "all" && range !== "custom") {
                    q = q.gte("start_at", startOfDay.toISOString());
                    if (range === "today") q = q.lte("start_at", endOfDay.toISOString());
                    if (range === "week") q = q.lte("start_at", in7.toISOString());
                    if (range === "month") q = q.lte("start_at", in30.toISOString());
                }
                
                if (range === "custom" && startDate && endDate) {
                    const startIso = new Date(startDate + "T00:00:00").toISOString();
                    const endIso = new Date(endDate + "T23:59:59").toISOString();
                    q = q.gte("start_at", startIso).lte("start_at", endIso);
                }
                
                // Pricing filter
                if (onlyFree) q = q.eq("is_free", true);
                
                // Event type filter
                if (eventTypes.length > 0) {
                    q = q.in("event_type", eventTypes);
                }
                
                // Age restriction filter
                if (ageRestriction !== "All Ages") {
                    q = q.eq("age_restriction", ageRestriction);
                }
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
                const rows: Ev[] = (data ?? []).map((r: unknown) => ({
                    ...(r as Record<string, unknown>),
                    lat: (r as { lat: number | null }).lat != null ? Number((r as { lat: number | null }).lat) : null,
                    lng: (r as { lng: number | null }).lng != null ? Number((r as { lng: number | null }).lng) : null,
                    image_url: (r as { image_url: string | null }).image_url ?? null,
                    venue_name: (r as { venue_name: string | null }).venue_name ?? null,
                })) || [];
                setEvents(rows);
            } catch (e) {
                console.error("Fetch crash", e);
                setEvents([]);
            }
        };
        load();
    }, [range, onlyFree, startDate, endDate, eventTypes, ageRestriction]);
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

    // The search functionality is now handled by the context in the header
    // This component will automatically respond to URL parameter changes

    return (
        <div className="min-h-screen bg-[rgb(var(--bg))]">
            {/* Header with Post Event Button */}
            <div className="relative z-10 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text))]">Event Map</h1>
                            <p className={`text-base sm:text-lg ${tokens.muted}`}>Discover events near you</p>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link
                                href="/events/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                            >
                                Post Event
                            </Link>
                            
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--bg))] transition-colors"
                            >
                                List View
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="sticky top-0 z-10 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
                {/* Search Section */}
                <div className="px-4 py-4">
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
                            <input
                                type="text"
                                placeholder="Search events, venues, or locations..."
                                className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-lg token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleMapSearch();
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={handleMapSearch}
                            className="w-full mt-3 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
                        >
                            Search Map
                        </button>
                    </div>
                </div>
                
                {/* Filter Bar - Full Width */}
                <FilterBar
                    range={range}
                    setRange={setRange}
                    onlyFree={onlyFree}
                    setOnlyFree={setOnlyFree}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    eventTypes={eventTypes}
                    setEventTypes={setEventTypes}
                    ageRestriction={ageRestriction}
                    setAgeRestriction={setAgeRestriction}
                />
            </div>

            <div className="grid md:grid-cols-[2fr,1fr] gap-6 max-w-6xl mx-auto px-4 py-6">
              <div className="relative w-full h-[52.5vh] rounded-2xl token-border overflow-hidden">
                {error && (
                  <div className="absolute top-4 left-4 z-10 text-yellow-400 px-3 py-2 text-sm font-bold">
                    {error}
                  </div>
                )}
                {searchLocation && (
                  <div className="absolute top-2 left-0 right-0 z-10 text-center">
                    <div className="text-xs text-[rgb(var(--text))] font-normal">
                      Showing events near:
                    </div>
                    <div className="text-lg text-[rgb(var(--text))] font-bold -mt-1">
                      {searchLocation.formatted.split(',').slice(0, 2).join(', ')}
                    </div>
                  </div>
                )}
                <div ref={mapEl} className="w-full h-full" />
              </div>

              <aside className="space-y-3 pb-6">
                <div className="text-sm text-[rgb(var(--muted))] text-center">{uniqueEvents.length} upcoming at this location</div>

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
                      className={`text-left rounded-lg token-border p-3 bg-[rgb(var(--panel))] hover:border-[color:var(--border-color)] ${selectedId===ev.id ? "outline outline-1 outline-blue-500" : ""}`}
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
                        {ev.event_type ? ` · ${ev.event_type}` : ""}
                      </div>
                    </button>
                  ))}

                  {uniqueEvents.length === 0 && (
                    <div className="rounded-lg token-border p-3 bg-[rgb(var(--panel))] text-sm text-[rgb(var(--text))]">
                      No events match these filters.
                    </div>
                  )}
                </div>

                {selected && (
                  <div className="rounded-lg token-border p-3 bg-[rgb(var(--panel))]">
                    <div className="text-sm font-semibold">{selected.title}</div>
                    <div className="text-xs text-zinc-600 mt-1">
                      {fmt(selected.start_at)}
                      {selected.venue_name ? " · " + selected.venue_name : ""}
                      {selected.event_type ? ` · ${selected.event_type}` : ""}
                    </div>
                    {selected.age_restriction && selected.age_restriction !== "All Ages" && (
                      <div className="text-xs text-zinc-500 mt-1">
                        Age: {selected.age_restriction}
                      </div>
                    )}
                  </div>
                )}
              </aside>
            </div>

            {/* Bottom spacing for mobile navigation */}
            <div className="pb-20 sm:pb-0"></div>
        </div>
    );
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
    id: string;
    title: string;
    start_at: string;
    lat?: number;
    lng?: number;
    image_url?: string | null;
    is_free?: boolean | null;
    venue_name?: string | null;
    event_type?: string | null;
    age_restriction?: string | null;
}) {
    const img = ev.image_url ? `<img src="${escapeHtml(ev.image_url)}" alt="" class="w-full h-28 object-cover rounded-t-xl">` : "";
    const badge = ev.is_free ? `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-green-50 border-green-200 text-green-700">Free</span>` : `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-amber-50 border-amber-200 text-amber-700">Paid</span>`;
    
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
        <div class="text-xs text-[rgb(var(--muted))] mt-1">${fmt(ev.start_at)}${ev.venue_name ? " · " + escapeHtml(ev.venue_name) : ""}</div>
        ${eventTypeInfo}
        ${ageInfo}
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