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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Find what&apos;s poppin&apos; this week.
          </h1>
          <p className={`mt-3 text-base sm:text-lg ${tokens.muted} max-w-2xl mx-auto`}>
          Local happenings, curated just for you.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/map"
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm bg-brand text-white hover:${tokens.panel}`}
            >
              Explore Events
            </Link>
            <Link
              href="/events/new"
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm ${tokens.border} ${tokens.muted} ${tokens.panel}
                          hover:bg-white/10 html.light:hover:bg-zinc-50`}
            >
              Post an Event
            </Link>
          </div>
        </div>
      </section>

      {/* Mini Map */}
      <section className="max-w-6xl mx-auto px-4 my-18">
        <MiniMap />
      </section>

      {/* Featured Events */}
      <FeaturedEvents />

      {/* Why Poppin Works */}
      <section className={`${tokens.panel} py-8 mt-20 pb-24`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-3 text-center">Why Poppin Works</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className={`card p-3 ${tokens.border}`}>
              <h3 className="font-bold mb-1 text-xs">Verified Organizers</h3>
              <p className={`text-xs ${tokens.muted}`}>Only approved hosts, no spam.</p>
            </div>
            <div className={`card p-3 ${tokens.border}`}>
              <h3 className="font-bold mb-1 text-xs">Curated Events</h3>
              <p className={`text-xs ${tokens.muted}`}>Fresh list of local things to do.</p>
            </div>
            <div className={`card p-3 ${tokens.border}`}>
              <h3 className="font-bold mb-1 text-xs">Easy Planning</h3>
              <p className={`text-xs ${tokens.muted}`}>Save, share, and get reminders.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
