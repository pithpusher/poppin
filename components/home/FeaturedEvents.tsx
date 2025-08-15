// components/home/FeaturedEvents.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Ev = {
  id: string;
  title: string;
  start_at: string;
  image_url: string | null;
  is_free?: boolean | null;
};

export default function FeaturedEvents() {
  const [rows, setRows] = useState<Ev[]>([]);

  useEffect(() => {
    const load = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("id,title,start_at,image_url,is_free")
        .eq("status", "approved")
        .gte("start_at", now)
        .order("start_at", { ascending: true })
        .limit(6);
      if (!error && data) setRows(data as Ev[]);
    };
    load();
  }, []);

  if (!rows.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 my-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Featured this week</h2>
        <a href="/map" className="text-sm text-blue-400 underline html.light:text-blue-600">See all</a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {rows.map((ev) => (
          <a key={ev.id} href={`/e/${ev.id}`} className="group rounded-xl overflow-hidden token-border bg-[rgb(var(--panel))] html.light:bg-white hover:shadow-card transition">
            <div className="aspect-[4/3] bg-black/20">
              {ev.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ev.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop&crop=center" 
                  alt="Event placeholder" 
                  className="w-full h-full object-cover opacity-80" 
                />
              )}
            </div>
            <div className="p-3">
              <div className="text-sm font-bold line-clamp-1 mb-1">{ev.title}</div>
              <div className="text-xs text-zinc-400 html.light:text-zinc-600">{fmt(ev.start_at)}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
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
