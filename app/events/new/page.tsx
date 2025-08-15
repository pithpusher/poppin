// ==============================
// FILE: app/events/new/page.tsx
// (address required + autocomplete; Free checkbox -> Ticket URL; geocode before insert)
// ==============================
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Suggestion = { label: string; center: [number, number] };

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [ticketUrl, setTicketUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Debounced fetch for suggestions
  useEffect(() => {
    const q = address.trim();
    if (!q) {
      setSuggestions([]);
      setShowSug(false);
      setSelectedCoords(null);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: q }),
        });
        const payload = await res.json();
        if (!res.ok) {
          setSuggestions([]);
          setShowSug(false);
          return;
        }
        const s: Suggestion[] = payload.suggestions || [];
        setSuggestions(s);
        setShowSug(s.length > 0);
      } catch {
        setSuggestions([]);
        setShowSug(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [address]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required");
    if (!startAt) return setError("Start date/time is required");
    if (!address.trim()) return setError("Address is required");
    if (!isFree && !ticketUrl.trim()) return setError("Ticket URL is required for paid events");

    setSubmitting(true);
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      let finalAddress = address;

      if (selectedCoords) {
        lat = selectedCoords.lat;
        lng = selectedCoords.lng;
      } else {
        // fallback: geocode once on submit
        const res = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        const geo = await res.json();
        if (!res.ok) throw new Error(geo?.error || "Failed to geocode");
        lat = geo.lat;
        lng = geo.lng;
        finalAddress = geo.formatted || address;
      }

      const price_cents = isFree ? 0 : 1; // any non-zero marks Paid; replace with real price if you add pricing

      const { data, error } = await supabase
        .from("events")
        .insert({
          title,
          start_at: new Date(startAt).toISOString(),
          venue_name: venue || null,
          address: finalAddress,
          lat,
          lng,
          price_cents,
          ticket_url: isFree ? null : ticketUrl.trim(),
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      window.location.href = `/e/${data.id}`; // adjust route if needed
    } catch (err: any) {
      setError(err.message || "Could not create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Post an event</h1>

      <form onSubmit={onSubmit} className="space-y-4 relative">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm mb-1">Start</label>
          <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm mb-1">Venue name</label>
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Optional" />
        </div>

        <div className="relative">
          <label className="block text-sm mb-1">Address</label>
          <Input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setSelectedCoords(null);
            }}
            placeholder="123 Main St, City, ST"
            required
            onFocus={() => suggestions.length && setShowSug(true)}
          />
          {showSug && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg token-border bg-white shadow-md">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={() => {
                    setAddress(s.label);
                    setSelectedCoords({ lat: s.center[1], lng: s.center[0] });
                    setShowSug(false);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isFree"
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="isFree" className="text-sm">
            This event is free
          </label>
        </div>

        {!isFree && (
          <div>
            <label className="block text-sm mb-1">Ticket URL</label>
            <Input type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://…" required />
          </div>
        )}

        {error && <div className="text-sm text-orange-600">{error}</div>}

        <Button disabled={submitting}>{submitting ? "Posting..." : "Post event"}</Button>
      </form>
    </div>
  );
}
