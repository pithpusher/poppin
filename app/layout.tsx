// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import ThemeProvider from "@/components/theme/ThemeProvider";
import BottomNav from "@/components/ui/BottomNav";
import Logo from "@/components/icons/Logo";
import LocationSearchBar from "@/components/ui/LocationSearchBar";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { LocationSearchProvider } from "@/components/context/LocationSearchContext";

export const metadata: Metadata = {
  title: "Poppin",
  description: "Find and share local events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex flex-col overflow-hidden">
                <ThemeProvider>
          <LocationSearchProvider>
            {/* Top bar */}
            <header className="sticky top-0 z-20 token-border-b bg-[rgb(var(--bg))]/80 backdrop-blur light:bg-white/80">
              <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Logo width={70} height={22} className="text-[rgb(var(--text))]" />
                </Link>
                
                {/* Search Bar - Center */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <LocationSearchBar 
                    placeholder="Search for a location..."
                    className="w-52"
                  />
                </div>
                
                {/* Right side controls */}
                <div className="flex items-center justify-end gap-1 flex-1">
                  <ThemeToggle />
                  <HamburgerMenu />
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">{children}</main>

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
