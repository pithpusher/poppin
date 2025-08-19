// app/page.tsx
import MiniMap from "@/components/map/MiniMap";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import { tokens } from "@/components/tokens";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-[rgb(var(--bg))]">
      {/* Hero */}
      <section
        className={`
          py-12 sm:py-16
        `}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find what&apos;s poppin&apos;.
          </h1>
          <p className={`mt-3 text-lg sm:text-xl ${tokens.muted} max-w-2xl mx-auto`}>
          Local happenings, curated just for you.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/map"
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm bg-brand text-white hover:${tokens.panel}`}
            >
              View Events Near You
            </Link>
            <Link
              href="/events/new"
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm ${tokens.border} ${tokens.muted} ${tokens.panel}
                          hover:bg-white/10 html.light:hover:bg-zinc-50`}
            >
              Post Yours
            </Link>
          </div>
        </div>
      </section>

      {/* Mini Map */}
      <section className="max-w-6xl mx-auto px-4 my-18">
        <MiniMap />
        <div className="text-center mt-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            See All Events
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      <FeaturedEvents />
      
      {/* Conversion CTA - Become an Organizer */}
      <section className="max-w-6xl mx-auto px-4 mt-16 mb-20">
        <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text))] mb-4">
            Have events to share?
          </h2>
          <p className={`text-base sm:text-lg ${tokens.muted} mb-6 max-w-2xl mx-auto`}>
            Join our community of organizers and reach thousands of people in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/organizer/apply"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
            >
              Become an Organizer
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--text))] rounded-xl text-sm hover:bg-[rgb(var(--panel))] transition-colors"
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
    </div>
  );
}
