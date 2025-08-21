'use client';

import React from 'react';
import EnhancedEventCard from './EnhancedEventCard';

interface EventCardGridProps {
  events: Array<{
    id: string;
    title: string;
    start_at: string;
    venue_name: string | null;
    lat: number | null;
    lng: number | null;
    image_url: string | null;
    status: string;
    is_free?: boolean | null;
    price_cents?: number | null;
    event_type?: string | null;
    age_restriction?: string | null;
  }>;
  onEventClick?: (eventId: string) => void;
  onDirectionsClick?: (lat: number, lng: number) => void;
  className?: string;
}

export default function EventCardGrid({ 
  events, 
  onEventClick, 
  onDirectionsClick, 
  className = "" 
}: EventCardGridProps) {
  if (events.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-[rgb(var(--muted))]">
          <p className="text-lg font-medium mb-2">No events found</p>
          <p className="text-sm">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {events.map((event) => (
        <EnhancedEventCard
          key={event.id}
          event={event}
          onEventClick={onEventClick}
          onDirectionsClick={onDirectionsClick}
        />
      ))}
    </div>
  );
}
