// app/page.tsx
import MiniMap from "@/components/map/MiniMap";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import { tokens } from "@/components/tokens";
import Link from "next/link";
import { Suspense } from "react";
import { EventListSkeleton } from "@/components/ui/Skeleton";

export default function HomePage() {
  return (
    <div className="bg-[rgb(var(--bg))]">
      {/* Hero with Mini Map Background */}
      <section className="relative h-[calc(100vh-120px)]">
        {/* Full Bleed Mini Map Background */}
        <div className="absolute inset-0 w-full h-full">
          <MiniMap className="h-full" showFullMapButton={false} />
        </div>
        
        {/* Hero Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            {/* Glass Effect Background */}
            <div className="relative">
              {/* Blurred Glass Background */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl -m-4 md:-m-8 lg:-m-12"></div>
              
              {/* Content Container */}
              <div className="relative z-10 p-4 md:p-8 lg:p-12">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  Find what&apos;s poppin&apos;.
                </h1>
                <p className={`mt-3 md:mt-4 text-lg sm:text-xl md:text-2xl ${tokens.muted} max-w-2xl md:max-w-3xl mx-auto`}>
                Local happenings, curated just for you.
                </p>
                <div className="mt-6 md:mt-8 flex flex-row justify-center gap-3 md:gap-4">
                  <Link
                    href="/map"
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-brand text-white hover:${tokens.panel} transition-all duration-200`}
                  >
                    View Events Near You
                  </Link>
                  <Link
                    href="/post"
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 md:px-6 md:py-3 text-sm md:text-base ${tokens.border} ${tokens.muted} ${tokens.panel}
                                  hover:bg-white/10 html.light:hover:bg-zinc-50 transition-colors duration-200`}
                  >
                    Post Yours
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* See All Events Button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href="/calendar"
              className={`inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm md:text-base ${tokens.border} ${tokens.muted} ${tokens.panel} hover:bg-white/10 html.light:hover:bg-zinc-50 transition-all duration-200`}
            >
              View Calendar of Events
            </Link>
            <Link
              href="/organizers"
              className={`inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm md:text-base ${tokens.border} ${tokens.muted} ${tokens.panel} hover:bg-white/10 html.light:hover:bg-zinc-50 transition-all duration-200`}
            >
              Browse Organizers
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events with Skeleton Loading */}
      <Suspense fallback={<EventListSkeleton count={6} />}>
        <FeaturedEvents />
      </Suspense>
      
      {/* Conversion CTA - Become an Organizer */}
      <section className="max-w-7xl mx-auto px-4 mt-16 md:mt-20 lg:mt-24 mb-20 md:mb-24">
        <div className="bg-[rgb(var(--panel))] token-border rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[rgb(var(--text))] mb-4 md:mb-6">
            Have events to share?
          </h2>
          <p className={`text-base sm:text-lg md:text-xl ${tokens.muted} mb-6 md:mb-8 max-w-2xl md:max-w-3xl mx-auto`}>
            Join our community of organizers and reach thousands of people in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link
              href="/organizer/apply"
              className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[rgb(var(--brand))] text-white rounded-xl text-sm md:text-base font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
            >
              Become an Organizer
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 border border-[rgb(var(--border))] text-[rgb(var(--text))] rounded-xl text-sm md:text-base hover:bg-[rgb(var(--panel))] transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Why Poppin Works - Hidden for now */}
      {/* <section className={`${tokens.panel} py-8 mt-20 pb-24`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-3 text-center">Why Poppin Works</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className={`card p-3 ${tokens.border}`}>
              <h3 className="font-bold mb-1 text-xs">Verified Organizers</h3>
              <p className={`text-xs ${tokens.muted}`}>Real people, real groups. No fake posts, no junk invites.</p>
            </div>
            <div className={`card p-3 ${tokens.border}`}>
              <h3 className="font-bold mb-1 text-xs">Curated Events</h3>
              <p className={`text-xs ${tokens.muted}`}>Hand-picked and worth your time. Always fresh, never filler.</p>
            </div>
            <div className={`card p-3 ${tokens.border}`}>
              <h3 className="font-bold mb-1 text-xs">Easy Planning</h3>
              <p className={`text-xs ${tokens.muted}`}>Save it, share it, and we'll remind you when it's go-time.</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </div>
  );
}
