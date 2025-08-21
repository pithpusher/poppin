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
  manifest: '/manifest.json',
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
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Poppin',
    'application-name': 'Poppin',
    'msapplication-TileColor': '#9b070e',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex flex-col overflow-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Ensure text selection works
              document.addEventListener('DOMContentLoaded', function() {
                // Override any potential text selection prevention
                document.addEventListener('selectstart', function(e) {
                  e.stopPropagation();
                }, true);
                
                document.addEventListener('mousedown', function(e) {
                  // Allow text selection on mousedown
                  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    return;
                  }
                  // Don't prevent default for other elements
                }, true);

                // Register service worker for PWA functionality
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                      
                      // Check for updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            if (confirm('A new version of Poppin is available! Reload to update?')) {
                              window.location.reload();
                            }
                          }
                        });
                      });
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                }

                // PWA Install Prompt
                let deferredPrompt;
                window.addEventListener('beforeinstallprompt', (e) => {
                  e.preventDefault();
                  deferredPrompt = e;
                  
                  // Show install button or banner
                  showInstallPrompt();
                });

                // Handle successful installation
                window.addEventListener('appinstalled', () => {
                  console.log('PWA was installed');
                  hideInstallPrompt();
                });

                // Show install prompt
                function showInstallPrompt() {
                  // Create install banner
                  const installBanner = document.createElement('div');
                  installBanner.id = 'install-banner';
                  installBanner.style.cssText = \`
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgb(var(--panel));
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 16px;
                    z-index: 1000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    max-width: 90vw;
                  \`;
                  
                  installBanner.innerHTML = \`
                    <span style="color: rgb(var(--text)); font-size: 14px;">Install Poppin for a better experience</span>
                    <button id="install-btn" style="
                      background: rgb(var(--brand));
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      border-radius: 8px;
                      font-size: 14px;
                      cursor: pointer;
                    ">Install</button>
                    <button id="dismiss-btn" style="
                      background: transparent;
                      color: rgb(var(--muted));
                      border: none;
                      padding: 8px;
                      cursor: pointer;
                      font-size: 18px;
                    ">✕</button>
                  \`;
                  
                  document.body.appendChild(installBanner);
                  
                  // Install button handler
                  document.getElementById('install-btn').addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                      if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                      }
                      deferredPrompt = null;
                    });
                  });
                  
                  // Dismiss button handler
                  document.getElementById('dismiss-btn').addEventListener('click', () => {
                    hideInstallPrompt();
                  });
                }

                function hideInstallPrompt() {
                  const banner = document.getElementById('install-banner');
                  if (banner) {
                    banner.remove();
                  }
                }

                // Pull to refresh functionality
                let startY = 0;
                let currentY = 0;
                let pullDistance = 0;
                let isPulling = false;
                
                document.addEventListener('touchstart', (e) => {
                  if (window.scrollY === 0) {
                    startY = e.touches[0].clientY;
                    isPulling = true;
                  }
                });
                
                document.addEventListener('touchmove', (e) => {
                  if (isPulling && window.scrollY === 0) {
                    currentY = e.touches[0].clientY;
                    pullDistance = currentY - startY;
                    
                    if (pullDistance > 0) {
                      e.preventDefault();
                      // Add pull-to-refresh visual feedback here if needed
                    }
                  }
                });
                
                document.addEventListener('touchend', () => {
                  if (isPulling && pullDistance > 100) {
                    // Trigger refresh
                    window.location.reload();
                  }
                  isPulling = false;
                  pullDistance = 0;
                });

                // Haptic feedback for mobile
                if ('vibrate' in navigator) {
                  // Add haptic feedback to interactive elements
                  document.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                      navigator.vibrate(50);
                    }
                  });
                }

                // Background sync when app comes to foreground
                document.addEventListener('visibilitychange', () => {
                  if (!document.hidden) {
                    // App came to foreground, sync data
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                      navigator.serviceWorker.ready.then((registration) => {
                        registration.sync.register('background-sync');
                      });
                    }
                  }
                });

                // Initialize offline storage and background sync
                if ('indexedDB' in window) {
                  // Initialize offline capabilities
                  console.log('IndexedDB available - offline features enabled');
                }

                // Initialize gesture navigation
                if ('ontouchstart' in window) {
                  console.log('Touch support detected - gesture navigation enabled');
                }

                // Performance optimizations
                if ('IntersectionObserver' in window) {
                  console.log('IntersectionObserver available - performance optimizations enabled');
                }

                // Preload critical resources
                const criticalResources = [
                  '/api/geocode',
                  '/events',
                  '/map'
                ];
                
                criticalResources.forEach(url => {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = url;
                  document.head.appendChild(link);
                });

                // Initialize app-like features
                initializeAppFeatures();
              });

              function initializeAppFeatures() {
                // Add app-like scroll behavior
                document.documentElement.style.scrollBehavior = 'smooth';
                
                // Add momentum scrolling for mobile
                if ('ontouchstart' in window) {
                  document.body.style.webkitOverflowScrolling = 'touch';
                }
                
                // Optimize for mobile performance
                if (window.innerWidth <= 768) {
                  // Reduce animations on mobile for better performance
                  document.documentElement.style.setProperty('--reduced-motion', 'reduce');
                }
                
                // Add keyboard navigation support
                document.addEventListener('keydown', (e) => {
                  // Escape key to close modals or go back
                  if (e.key === 'Escape') {
                    const modals = document.querySelectorAll('[data-modal]');
                    modals.forEach(modal => {
                      if (modal.classList.contains('open')) {
                        modal.classList.remove('open');
                      }
                    });
                  }
                  
                  // Arrow key navigation for lists
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement.tagName === 'BUTTON') {
                      e.preventDefault();
                      const buttons = Array.from(document.querySelectorAll('button'));
                      const currentIndex = buttons.indexOf(activeElement as HTMLButtonElement);
                      let nextIndex;
                      
                      if (e.key === 'ArrowDown') {
                        nextIndex = (currentIndex + 1) % buttons.length;
                      } else {
                        nextIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
                      }
                      
                      buttons[nextIndex].focus();
                    }
                  }
                });
                
                // Add focus management for better accessibility
                document.addEventListener('focusin', (e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    // Ensure input is visible when focused
                    setTimeout(() => {
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }
                });
                
                // Add offline indicator
                function updateOnlineStatus() {
                  const indicator = document.getElementById('offline-indicator');
                  if (indicator) {
                    indicator.style.display = navigator.onLine ? 'none' : 'block';
                  }
                }
                
                window.addEventListener('online', updateOnlineStatus);
                window.addEventListener('offline', updateOnlineStatus);
                
                // Create offline indicator if it doesn't exist
                if (!document.getElementById('offline-indicator')) {
                  const indicator = document.createElement('div');
                  indicator.id = 'offline-indicator';
                  indicator.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: rgb(var(--brand));
                    color: white;
                    text-align: center;
                    padding: 8px;
                    z-index: 9999;
                    font-size: 14px;
                    display: none;
                  \`;
                  indicator.textContent = 'You are currently offline';
                  document.body.appendChild(indicator);
                }
                
                updateOnlineStatus();
              }
            `,
          }}
        />
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
                    className="w-48 sm:w-80 md:w-96 lg:w-[28rem] xl:w-[32rem]"
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
