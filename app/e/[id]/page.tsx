// app/e/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type EventRow = {
  id: string;
  title: string;
  start_at: string;
  description?: string | null;
  image_url?: string | null;
  is_free?: boolean | null;
  price_cents?: number | null;
  venue_name?: string | null;
  lat?: number | null;
  lng?: number | null;
  ticket_url?: string | null;
  website_url?: string | null;
  organizer_id?: string | null;
};

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [ev, setEv] = useState<EventRow | null>(null);
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setEv(data as EventRow);
        if (data.organizer_id) {
          const { data: orgRow } = await supabase
            .from("organizers")
            .select("id,slug,name,avatar_url,bio,website_url,socials")
            .eq("id", data.organizer_id)
            .single();
          setOrg(orgRow);
        }
      }
    })();
  }, [id]);

  if (!ev) return <div className="max-w-3xl mx-auto px-4 py-10">Loading…</div>;

  const isFree = !!ev.is_free || (ev.price_cents ?? 0) === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {ev.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ev.image_url} alt="" className="w-full aspect-[16/9] object-cover rounded-xl border border-[color:rgb(var(--border))]" />
      )}

      <h1 className="mt-6 text-3xl font-bold">{ev.title}</h1>
      <div className="mt-2 flex items-center gap-2">
        <Badge isFree={isFree} />
        <span className="text-sm text-[rgb(var(--muted))]">
          {fmt(ev.start_at)}{ev.venue_name ? ` · ${ev.venue_name}` : ""}
        </span>
      </div>

      {ev.description && (
        <div className="prose prose-invert max-w-none mt-6 text-[15px] leading-7 text-[rgb(var(--text))]">
          {ev.description}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {ev.ticket_url && (
          <a href={ev.ticket_url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-brand text-white text-sm">
            Get Tickets
          </a>
        )}
        {ev.website_url && (
          <a href={ev.website_url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl border border-[color:rgb(var(--border))] text-sm">
            Event Website
          </a>
        )}
        {ev.lat && ev.lng && (
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps?q=${ev.lat},${ev.lng}`}
            className="px-4 py-2 rounded-xl border border-[color:rgb(var(--border))] text-sm"
          >
            Directions
          </a>
        )}
      </div>

      {org && (
        <div className="mt-10 p-4 rounded-xl border border-[color:rgb(var(--border))] bg-[rgb(var(--panel))]">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {org.avatar_url && <img src={org.avatar_url} alt="" className="w-12 h-12 rounded-full border border-[color:rgb(var(--border))]" />}
            <div className="flex-1">
              <a href={`/o/${org.slug}`} className="font-semibold hover:underline">{org.name}</a>
              {org.bio && <div className="text-sm text-[rgb(var(--muted))] line-clamp-2">{org.bio}</div>}
            </div>
            <SocialLinks socials={org.socials} website={org.website_url} />
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ isFree }: { isFree: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
      isFree ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
    }`}>
      {isFree ? "Free" : "Paid"}
    </span>
  );
}

function SocialLinks({ socials, website }: { socials?: any; website?: string | null }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {website && <a href={website} target="_blank" rel="noreferrer" className="underline">Website</a>}
      {socials?.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="underline">Instagram</a>}
      {socials?.facebook && <a href={socials.facebook} target="_blank" rel="noreferrer" className="underline">Facebook</a>}
      {socials?.x && <a href={socials.x} target="_blank" rel="noreferrer" className="underline">X</a>}
      {socials?.tiktok && <a href={socials.tiktok} target="_blank" rel="noreferrer" className="underline">TikTok</a>}
    </div>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
