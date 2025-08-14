// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "Poppin",
  description: "Find and share local events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgb(var(--bg))]/80 backdrop-blur html.light:bg-white/80 html.light:border-zinc-200">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold">Poppin</Link>
              <nav className="hidden sm:flex items-center gap-4 text-sm">
                <Link href="/map" className="hover:underline">Map</Link>
                <Link href="/events/new" className="hover:underline">Post</Link>
                <Link href="/organizer/apply" className="hover:underline">Apply</Link>
                <Link href="/auth" className="hover:underline">Sign in</Link>
                <ThemeToggle />
              </nav>
              {/* Mobile toggle only */}
              <div className="sm:hidden">
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          {/* Bottom tab bar (mobile) */}
          <nav className="sm:hidden sticky bottom-0 z-20 border-t border-white/10 bg-[rgb(var(--bg))]/90 backdrop-blur html.light:bg-white/90 html.light:border-zinc-200">
            <div className="grid grid-cols-4 text-xs">
              <Tab href="/" label="Home" />
              <Tab href="/map" label="Map" />
              <Tab href="/events/new" label="Post" />
              <Tab href="/auth" label="Account" />
            </div>
          </nav>

          <footer className="hidden sm:block border-t border-white/10 html.light:border-zinc-200">
            <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-zinc-400 html.light:text-zinc-600 flex justify-between">
              <span>&copy; {new Date().getFullYear()} Poppin</span>
              <span>Made for your city</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Tab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center py-3 text-zinc-400 hover:text-white html.light:text-zinc-600 html.light:hover:text-zinc-900"
    >
      <span>{label}</span>
    </Link>
  );
}
