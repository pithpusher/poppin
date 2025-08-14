// app/page.tsx
import MiniMap from "@/components/map/MiniMap";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import { tokens } from "@/components/tokens";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className={`
          py-12 sm:py-16
          ${tokens.bg}          /* flat in light */
          dark:${tokens.bg}     /* keep bg consistent in dark */
        `}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Find what’s poppin’ this week
          </h1>
          <p className={`mt-3 text-base sm:text-lg ${tokens.muted} max-w-2xl mx-auto`}>
            A clean, push-first local events app. Less noise, more go-time.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/map"
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm bg-brand text-white hover:${tokens.panel}`}
            >
              Explore Events
            </a>
            <a
              href="/events/new"
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm border ${tokens.muted} ${tokens.panel}
                          hover:bg-white/10 html.light:hover:bg-zinc-50`}
            >
              Post an Event
            </a>
          </div>
        </div>
      </section>

      {/* Mini Map */}
      <section className="max-w-6xl mx-auto px-4 my-18">
        <MiniMap />
      </section>

      {/* Featured Events */}
      <FeaturedEvents />

      {/* How it works */}
      <section className={`${tokens.panel} html.light:bg-gray-50 py-14`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className={`card p-5 ${tokens.border}`}>
              <h3 className="font-semibold mb-1">Browse by map</h3>
              <p className={`text-sm ${tokens.muted}`}>See what’s around you right now.</p>
            </div>
            <div className={`card p-5 ${tokens.border}`}>
              <h3 className="font-semibold mb-1">Filter what you want</h3>
              <p className={`text-sm ${tokens.muted}`}>Date ranges and Free vs Paid, fast.</p>
            </div>
            <div className={`card p-5 ${tokens.border}`}>
              <h3 className="font-semibold mb-1">Post your event</h3>
              <p className={`text-sm ${tokens.muted}`}>
                Verified organizers reach locals who show up.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
