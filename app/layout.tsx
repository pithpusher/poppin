// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import ThemeProvider from "@/components/theme/ThemeProvider";
import BottomNav from "@/components/ui/BottomNav";
import Logo from "@/components/icons/Logo";
import LocationSearchBar from "@/components/ui/LocationSearchBar";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import { LocationSearchProvider } from "@/components/context/LocationSearchContext";

export const metadata: Metadata = {
  title: "Poppin",
  description: "Find and share local events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
                <ThemeProvider>
          <LocationSearchProvider>
            {/* Top bar */}
            <header className="sticky top-0 z-20 token-border-b bg-[rgb(var(--bg))]/80 backdrop-blur light:bg-white/80">
              <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Logo width={90} height={29} className="text-[rgb(var(--text))]" />
                </Link>
                
                {/* Search Bar - Center */}
                <div className="flex-1 max-w-md mx-auto">
                  <LocationSearchBar 
                    placeholder="Search for a location..."
                    className="w-full"
                  />
                </div>
                
                {/* Hamburger Menu */}
                <div className="flex-shrink-0">
                  <HamburgerMenu />
                </div>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            {/* Bottom navigation */}
            <BottomNav />

            <footer className="hidden sm:block token-border-t">
              <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-zinc-400 light:text-zinc-600 flex justify-between">
                <span>&copy; {new Date().getFullYear()} Poppin</span>
                <span>Made for your city</span>
              </div>
            </footer>
          </LocationSearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
