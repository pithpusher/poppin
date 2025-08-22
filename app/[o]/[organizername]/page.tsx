// app/o/[organizername]/page.tsx
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
  const { organizername } = useParams<{ organizername: string }>();
  const [org, setOrg] = useState<Org | null>(null);
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase
        .from("organizers")
        .select("*")
        .eq("slug", organizername)
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
  }, [organizername]);

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
    <div className="flex items-center gap-3">
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 001.414 1.414l3-3a4 4 0 000-5.656z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 012.828 2.828L12 12l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 001.414 1.414L12 12l3-3a4 4 0 000-5.656z" clipRule="evenodd" />
          </svg>
        </a>
      )}
      {socials?.instagram && (
        <a
          href={socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.49.49-1.297.807-2.026.807s-1.536-.317-2.026-.807c-.49-.49-.807-1.297-.807-2.026s.317-1.536.807-2.026c.49-.49 1.297-.807 2.026-.807s1.536.317 2.026.807c.49.49.807 1.297.807 2.026s-.317 1.536-.807 2.026z"/>
          </svg>
        </a>
      )}
      {socials?.twitter && (
        <a
          href={socials.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </a>
      )}
    </div>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
