// components/home/FeaturedEvents.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
    <section className="max-w-7xl mx-auto px-4 my-12 md:my-16 lg:my-20">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Featured this week</h2>
        <Link href="/map" className="text-sm md:text-base text-blue-400 underline html.light:text-blue-600 hover:text-blue-300 transition-colors">See all</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {rows.map((ev) => (
          <Link key={ev.id} href={`/e/${ev.id}`} className="group rounded-xl md:rounded-2xl overflow-hidden token-border bg-[rgb(var(--panel))] html.light:bg-white hover:shadow-card transition-all duration-200 hover:scale-[1.02]">
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
            <div className="p-3 md:p-4">
              <div className="text-sm md:text-base font-bold line-clamp-1 mb-1 md:mb-2">{ev.title}</div>
              <div className="text-xs md:text-sm text-zinc-400 html.light:text-zinc-600">{fmt(ev.start_at)}</div>
            </div>
          </Link>
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
