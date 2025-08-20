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
  title: "Poppin - Find What's Happening Near You",
  description: "Discover local events, concerts, meetups, and activities in your city. Join Poppin to find what's happening this weekend and connect with your community.",
  keywords: "local events, concerts, meetups, activities, community events, weekend plans, city events",
  authors: [{ name: "Poppin" }],
  creator: "Poppin",
  publisher: "Poppin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.APP_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Poppin - Find What's Happening Near You",
    description: "Discover local events, concerts, meetups, and activities in your city. Join Poppin to find what's happening this weekend and connect with your community.",
    url: '/',
    siteName: 'Poppin',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // You can add this image later
        width: 1200,
        height: 630,
        alt: 'Poppin - Local Events Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Poppin - Find What's Happening Near You",
    description: "Discover local events, concerts, meetups, and activities in your city.",
    images: ['/og-image.png'], // Same image as Open Graph
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex flex-col overflow-hidden">
                <ThemeProvider>
          <LocationSearchProvider>
            {/* Top bar */}
            <header className="sticky top-0 z-20 token-border-b bg-[rgb(var(--bg))]/80 backdrop-blur light:bg-white/80">
              <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Logo width={70} height={22} className="text-[rgb(var(--text))]" />
                </Link>
                
                {/* Search Bar - Center */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <LocationSearchBar 
                    placeholder="Search for a location..."
                    className="w-64 sm:w-80 md:w-96 lg:w-[28rem] xl:w-[32rem]"
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
              <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-zinc-400 light:text-zinc-600 flex justify-between">
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
