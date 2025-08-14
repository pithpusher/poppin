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
              ) : null}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium line-clamp-1">{ev.title}</div>
                <span
                  className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    ev.is_free ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}
                >
                  {ev.is_free ? "Free" : "Paid"}
                </span>
              </div>
              <div className="text-xs text-zinc-400 html.light:text-zinc-600 mt-1">{fmt(ev.start_at)}</div>
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
