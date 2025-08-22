'use client';

import React, { useState, useCallback } from 'react';
import SwipeableEventCard from '@/components/map/SwipeableEventCard';
import EnhancedPullToRefresh from '@/components/ui/EnhancedPullToRefresh';
import GestureNavigation from '@/components/ui/GestureNavigation';

// Sample event data for demo
const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival 2024',
    start_at: '2024-07-15T18:00:00Z',
    venue_name: 'Central Park Amphitheater',
    image_url: null,
    is_free: false,
    price_cents: 4500,
    event_type: 'Music'
  },
  {
    id: '2',
    title: 'Tech Startup Networking',
    start_at: '2024-06-20T19:00:00Z',
    venue_name: 'Innovation Hub Downtown',
    image_url: null,
    is_free: true,
    price_cents: null,
    event_type: 'Business'
  },
  {
    id: '3',
    title: 'Art Gallery Opening',
    start_at: '2024-06-25T17:00:00Z',
    venue_name: 'Modern Art Museum',
    image_url: null,
    is_free: false,
    price_cents: 2500,
    event_type: 'Art'
  },
  {
    id: '4',
    title: 'Food Truck Festival',
    start_at: '2024-07-10T12:00:00Z',
    venue_name: 'Riverside Park',
    image_url: null,
    is_free: true,
    price_cents: null,
    event_type: 'Food'
  },
  {
    id: '5',
    title: 'Yoga in the Park',
    start_at: '2024-06-30T08:00:00Z',
    venue_name: 'Bryant Park',
    image_url: null,
    is_free: true,
    price_cents: null,
    event_type: 'Wellness'
  }
];

// Sample content for gesture navigation
const navigationPages = [
  {
    title: 'Featured Events',
    content: (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Events</h2>
          <p className="text-gray-600">Discover the most popular events in your area</p>
        </div>
      </div>
    )
  },
  {
    title: 'Nearby Venues',
    content: (
      <div className="h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nearby Venues</h2>
          <p className="text-gray-600">Find great places to host your next event</p>
        </div>
      </div>
    )
  },
  {
    title: 'Event Categories',
    content: (
      <div className="h-full bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Categories</h2>
          <p className="text-gray-600">Browse events by type and interest</p>
        </div>
      </div>
    )
  }
];

export default function AdvancedMobileUXDemoPage() {
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  // Event action handlers
  const handleLike = useCallback((eventId: string) => {
    setLikedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const handleSave = useCallback((eventId: string) => {
    setSavedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const handleShare = useCallback((event: any) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      alert(`Sharing: ${event.title}`);
    }
  }, []);

  const handleAddToCalendar = useCallback((event: any) => {
    const startDate = new Date(event.start_at);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Event: ${event.title}\nVenue: ${event.venue_name || 'TBD'}`)}`;
    
    window.open(calendarUrl, '_blank');
  }, []);

  const handleViewDetails = useCallback((eventId: string) => {
    alert(`Viewing details for event: ${eventId}`);
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Data refreshed!');
  }, []);

  // Page change handler
  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
    console.log(`Navigated to page: ${pageIndex}`);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <div className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border-color))]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
            Advanced Mobile UX Demo
          </h1>
          <p className="text-[rgb(var(--muted))]">
            Showcasing swipe actions, enhanced pull-to-refresh, and gesture navigation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Feature Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-4">
            Mobile UX Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[rgb(var(--panel))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <div className="text-2xl mb-2">👆</div>
              <h3 className="font-semibold text-[rgb(var(--text))] mb-2">Swipe Actions</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Swipe left/right on event cards to like or save events with haptic feedback.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <div className="text-2xl mb-2">⬇️</div>
              <h3 className="font-semibold text-[rgb(var(--text))] mb-2">Enhanced Pull-to-Refresh</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Sophisticated haptic patterns and smooth animations for refreshing content.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--panel))] rounded-lg p-4 border border-[rgb(var(--border-color))]/20">
              <div className="text-2xl mb-2">🔄</div>
              <h3 className="font-semibold text-[rgb(var(--text))] mb-2">Gesture Navigation</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Swipe between tabs/pages with haptic feedback and smooth transitions.
              </p>
            </div>
          </div>
        </div>

        {/* Swipeable Event Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-4">
            Swipeable Event Cards
          </h2>
          <p className="text-[rgb(var(--muted))] mb-6">
            Swipe left to save, swipe right to like. Each action provides haptic feedback.
          </p>
          
          <div className="space-y-4">
            {sampleEvents.map((event) => (
              <SwipeableEventCard
                key={event.id}
                event={event}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onAddToCalendar={handleAddToCalendar}
                onViewDetails={handleViewDetails}
                isLiked={likedEvents.has(event.id)}
                isSaved={savedEvents.has(event.id)}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Pull-to-Refresh */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-4">
            Enhanced Pull-to-Refresh
          </h2>
          <p className="text-[rgb(var(--muted))] mb-6">
            Pull down to refresh with different haptic patterns for various interactions.
          </p>
          
          <EnhancedPullToRefresh onRefresh={handleRefresh} className="h-64">
            <div className="h-full bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-6 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                  Pull Down to Refresh
                </h3>
                <p className="text-[rgb(var(--muted))] text-sm">
                  Pull down from the top to trigger a refresh with haptic feedback
                </p>
                <div className="mt-4 text-xs text-[rgb(var(--muted))] space-y-1">
                  <div>• Light vibration when pulling</div>
                  <div>• Medium vibration at threshold</div>
                  <div>• Strong vibration when refresh starts</div>
                  <div>• Success pattern when complete</div>
                </div>
              </div>
            </div>
          </EnhancedPullToRefresh>
        </div>

        {/* Gesture Navigation */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-4">
            Gesture Navigation
          </h2>
          <p className="text-[rgb(var(--muted))] mb-6">
            Swipe left/right to navigate between pages with haptic feedback.
          </p>
          
          <div className="h-64">
            <GestureNavigation
              onPageChange={handlePageChange}
              showIndicators={true}
              showNavigation={true}
              autoPlay={false}
              className="h-full"
            >
              {navigationPages.map((page, index) => (
                <div key={index} className="h-full">
                  {page.content}
                </div>
              ))}
            </GestureNavigation>
          </div>
          
          <div className="mt-4 text-center text-sm text-[rgb(var(--muted))]">
            Current page: {navigationPages[currentPage].title}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[rgb(var(--panel))] rounded-lg p-6 border border-[rgb(var(--border-color))]/20">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">
            How to Use
          </h3>
          <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">1.</span>
              <span><strong>Swipeable Cards:</strong> Swipe left on event cards to save, swipe right to like. Each action provides haptic feedback.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">2.</span>
              <span><strong>Pull-to-Refresh:</strong> Pull down from the top of the refresh section to trigger a refresh with sophisticated haptic patterns.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">3.</span>
              <span><strong>Gesture Navigation:</strong> Swipe left/right on the navigation section to move between pages. Use arrow buttons or indicators for precise navigation.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[rgb(var(--brand))] font-medium">4.</span>
              <span><strong>Haptic Feedback:</strong> Different vibration patterns provide tactile feedback for various interactions (light, medium, heavy, and success patterns).</span>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-[rgb(var(--panel))] rounded-lg p-6 border border-[rgb(var(--border-color))]/20">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">
            Technical Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-[rgb(var(--text))] mb-2">Touch & Mouse Support</h4>
              <ul className="space-y-1 text-[rgb(var(--muted))]">
                <li>• Full touch gesture support</li>
                <li>• Mouse drag for desktop testing</li>
                <li>• Responsive touch thresholds</li>
                <li>• Smooth animations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[rgb(var(--text))] mb-2">Haptic Patterns</h4>
              <ul className="space-y-1 text-[rgb(var(--muted))]">
                <li>• Light: 10ms vibration</li>
                <li>• Medium: 20-30-20ms pattern</li>
                <li>• Heavy: 50-100-50ms pattern</li>
                <li>• Success: 20-50-20-50-20ms pattern</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </div>
  );
}
