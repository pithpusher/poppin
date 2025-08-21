'use client';

import React, { useState } from 'react';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import EventCardGrid from './EventCardGrid';
import EnhancedEventCard from './EnhancedEventCard';

interface EventListViewProps {
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

export default function EventListView({ 
  events, 
  onEventClick, 
  onDirectionsClick, 
  className = "" 
}: EventListViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    <div className={className}>
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Events</h3>
          <span className="text-sm text-[rgb(var(--muted))]">({events.length} found)</span>
        </div>
        
        <div className="flex items-center gap-1 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-[rgb(var(--brand))] text-white shadow-sm' 
                : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80'
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-[rgb(var(--brand))] text-white shadow-sm' 
                : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80'
            }`}
          >
            <ListBulletIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Display */}
      {viewMode === 'grid' ? (
        <EventCardGrid
          events={events}
          onEventClick={onEventClick}
          onDirectionsClick={onDirectionsClick}
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 overflow-hidden">
              <EnhancedEventCard
                event={event}
                onEventClick={onEventClick}
                onDirectionsClick={onDirectionsClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
