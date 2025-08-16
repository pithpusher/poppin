// app/o/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Org = {
  id: string;
  slug: string;
  name: string;
  avatar_url?: string | null;
  bio?: string | null;
  website_url?: string | null;
  socials?: any;
};

type Ev = {
  id: string;
  title: string;
  start_at: string;
  image_url?: string | null;
  is_free?: boolean | null;
};

export default function OrganizerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<Org | null>(null);
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase
        .from("organizers")
        .select("*")
        .eq("slug", slug)
        .single();
      if (!o) return;
      setOrg(o as Org);

      const { data: evs } = await supabase
        .from("events")
        .select("id,title,start_at,image_url,is_free")
        .eq("status", "approved")
        .eq("organizer_id", (o as any).id)
        .order("start_at", { ascending: true });
      setEvents((evs ?? []) as Ev[]);
    })();
  }, [slug]);

  if (!org) return <div className="max-w-5xl mx-auto px-4 py-10">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {org.avatar_url && <img src={org.avatar_url} className="w-16 h-16 rounded-full token-border" alt="" />}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{org.name}</h1>
          {org.bio && <p className="mt-1 text-[rgb(var(--muted))]">{org.bio}</p>}
          <div className="mt-2">
            <SocialLinks socials={org.socials} website={org.website_url} />
          </div>
        </div>
      </header>

      {events.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <a key={ev.id} href={`/e/${ev.id}`} className="rounded-xl token-border bg-[rgb(var(--panel))] overflow-hidden">
                <div className="aspect-[4/3] bg-black/10">
                  {ev.image_url && <img src={ev.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium line-clamp-1">{ev.title}</div>
                    <span className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      ev.is_free ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>{ev.is_free ? "Free" : "Paid"}</span>
                  </div>
                  <div className="text-xs text-[rgb(var(--muted))] mt-1">{fmt(ev.start_at)}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 text-[rgb(var(--muted))]">No upcoming events.</div>
      )}

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
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
