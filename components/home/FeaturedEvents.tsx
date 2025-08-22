// components/home/FeaturedEvents.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { EventCardSkeleton } from "@/components/ui/Skeleton";
import { EventImage } from "@/components/ui/ProgressiveImage";

type Ev = {
  id: string;
  title: string;
  start_at: string;
  image_url: string | null;
  is_free?: boolean | null;
};

export default function FeaturedEvents() {
  const [rows, setRows] = useState<Ev[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const now = new Date().toISOString();
        const { data, error: supabaseError } = await supabase
          .from("events")
          .select("id,title,start_at,image_url,is_free")
          .eq("status", "approved")
          .gte("start_at", now)
          .order("start_at", { ascending: true })
          .limit(6);
          
        if (supabaseError) {
          setError(supabaseError.message);
        } else if (data) {
          setRows(data as Ev[]);
        }
      } catch (err) {
        setError('Failed to load events');
        console.error('Error loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 my-12 md:my-16 lg:my-20">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Featured this week</h2>
          <Link href="/map" className="text-sm md:text-base text-blue-400 underline hover:text-blue-300 transition-colors">See all</Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="opacity-0" style={{ 
              animationDelay: `${i * 100}ms`,
              animation: 'fadeIn 0.3s ease-out forwards'
            }}>
              <EventCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 my-12 md:my-16 lg:my-20">
        <div className="text-center py-8">
          <div className="text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2">Failed to load events</h3>
          <p className="text-[rgb(var(--muted))] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // Don't show section if no events
  if (!rows.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 my-12 md:my-16 lg:my-20">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Featured this week</h2>
        <Link href="/map" className="text-sm md:text-base text-blue-400 underline html.light:text-blue-600 hover:text-blue-300 transition-colors">See all</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {rows.map((ev) => (
          <Link key={ev.id} href={`/e/${ev.id}`} className="group rounded-xl md:rounded-2xl overflow-hidden token-border bg-[rgb(var(--panel))] hover:shadow-card transition-all duration-200 hover:scale-[1.02]">
            <div className="aspect-[4/3] bg-black/20">
              <EventImage
                src={ev.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop&crop=center"}
                alt={ev.title}
                className="w-full h-full"
                priority={false}
              />
            </div>
            <div className="p-3 md:p-4">
              <div className="text-sm md:text-base font-bold line-clamp-1 mb-1 md:mb-2">{ev.title}</div>
              <div className="text-xs md:text-sm text-zinc-400">{fmt(ev.start_at)}</div>
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
