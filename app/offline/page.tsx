'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, WifiIcon, WifiOffIcon } from '@heroicons/react/24/outline';
import OfflineIndicator from '@/components/mobile/OfflineMode';
import { tokens } from '@/components/tokens';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <div className="bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--bg))] transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Link>
            
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[rgb(var(--text))]">Offline Management</h1>
              <p className={`text-base sm:text-lg md:text-xl ${tokens.muted}`}>
                Manage your offline data and sync settings
              </p>
            </div>

            {/* Online Status Badge */}
            <div className="ml-auto">
              <div className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                ${isOnline 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
                }
              `}>
                {isOnline ? (
                  <>
                    <WifiIcon className="w-4 h-4" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOffIcon className="w-4 h-4" />
                    Offline
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Offline Mode Component */}
          <OfflineIndicator 
            enableOfflineMode={true}
            maxCacheSize={100}
            onCacheUpdate={(stats) => {
              console.log('Cache updated:', stats);
            }}
            onSyncComplete={(status) => {
              console.log('Sync completed:', status);
            }}
          />

          {/* Additional Offline Information */}
          <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">About Offline Mode</h3>
            <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
              <p>
                Offline mode allows you to access cached events and data even when you're not connected to the internet.
                Your changes will be automatically synced when you come back online.
              </p>
              <p>
                The system automatically caches popular events, images, and user preferences to provide a seamless
                experience regardless of your connection status.
              </p>
              <p>
                You can manually control what gets cached, clear the cache, or force a sync at any time using
                the controls above.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/list"
                className="flex items-center gap-3 p-4 bg-[rgb(var(--bg))] rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
              >
                <div className="w-10 h-10 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">E</span>
                </div>
                <div>
                  <div className="font-medium text-[rgb(var(--text))]">Browse Events</div>
                  <div className="text-sm text-[rgb(var(--muted))]">View cached events</div>
                </div>
              </Link>
              
              <Link
                href="/organizers"
                className="flex items-center gap-3 p-4 bg-[rgb(var(--bg))] rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
              >
                <div className="w-10 h-10 bg-[rgb(var(--brand))] rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">O</span>
                </div>
                <div>
                  <div className="font-medium text-[rgb(var(--text))]">View Organizers</div>
                  <div className="text-sm text-[rgb(var(--muted))]">Browse organizer profiles</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-16 sm:h-0"></div>
      <div className="pb-12 sm:pb-0"></div>
    </div>
  );
}
