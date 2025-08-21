'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ClusterMarkerProps {
  count: number;
  center: [number, number];
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
  onClusterClick: (center: [number, number], events: any[]) => void;
  onEventClick: (eventId: string) => void;
}

export default function ClusterMarker({ 
  count, 
  center, 
  events, 
  onClusterClick, 
  onEventClick 
}: ClusterMarkerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const clusterRef = useRef<HTMLDivElement>(null);

  const handleClusterClick = () => {
    if (count === 1) {
      // Single event, just click the event
      onEventClick(events[0].id);
    } else {
      // Multiple events, expand cluster or zoom to area
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        onClusterClick(center, events);
      }
    }
  };

  const handleEventClick = (eventId: string) => {
    onEventClick(eventId);
    setIsExpanded(false);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatPrice = (priceCents: number | null) => {
    if (!priceCents) return 'Free';
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  // Auto-collapse cluster after delay
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <div className="relative">
      {/* Cluster Marker */}
      <div
        ref={clusterRef}
        className={`
          relative cursor-pointer transition-all duration-300 transform hover:scale-110
          ${count === 1 ? 'w-8 h-8' : 'w-12 h-12'}
        `}
        onClick={handleClusterClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
                 {/* Background Circle */}
         <div className={`
           absolute inset-0 rounded-full border-2 border-white shadow-lg
           ${count === 1 
             ? 'bg-red-600' 
             : count <= 5 
               ? 'bg-red-500' 
               : count <= 10 
                 ? 'bg-orange-500' 
                 : 'bg-yellow-500'
           }
           ${isHovered ? 'ring-4 ring-white/30' : ''}
         `} />
        
        {/* Count Text */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
          {count}
        </div>
        
        {/* Pulse Animation */}
        {isHovered && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        )}
      </div>

      {/* Expanded Cluster View */}
      {isExpanded && count > 1 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-h-96 overflow-hidden">
          {/* Arrow */}
          <div className="w-4 h-4 bg-[rgb(var(--panel))] border border-[rgb(var(--border-color))]/20 transform rotate-45 mx-auto -mb-2" />
          
          {/* Cluster Content */}
          <div className="bg-[rgb(var(--panel))] rounded-xl border border-[rgb(var(--border-color))]/20 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-3 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[rgb(var(--text))]">
                  {count} Events Nearby
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-[rgb(var(--panel))] rounded transition-colors"
                >
                  <ChevronDownIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                </button>
              </div>
              <p className="text-xs text-[rgb(var(--muted))] mt-1">
                Click to zoom to this area
              </p>
            </div>

            {/* Events List */}
            <div className="max-h-64 overflow-y-auto">
              {events.slice(0, 8).map((event) => (
                <div
                  key={event.id}
                  className="p-3 border-b border-[rgb(var(--border-color))]/20 last:border-b-0 hover:bg-[rgb(var(--bg))] transition-colors cursor-pointer"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Event Image */}
                    <div className="w-12 h-12 bg-[rgb(var(--bg))] rounded-lg flex-shrink-0 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[rgb(var(--brand))]/20 to-[rgb(var(--brand))]/40 flex items-center justify-center">
                          <MapPinIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[rgb(var(--text))] truncate">
                        {event.title}
                      </h4>
                      <div className="text-xs text-[rgb(var(--muted))] mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <span>🕒</span>
                          <span>{formatDate(event.start_at)}</span>
                        </div>
                        {event.venue_name && (
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span className="truncate">{event.venue_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`
                            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${event.is_free 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }
                          `}>
                            {formatPrice(event.price_cents)}
                          </span>
                          {event.event_type && (
                            <span className="text-xs text-[rgb(var(--muted))]">
                              {event.event_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {events.length > 8 && (
                <div className="p-3 text-center text-xs text-[rgb(var(--muted))] border-t border-[rgb(var(--border-color))]/20">
                  +{events.length - 8} more events
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-3 bg-[rgb(var(--bg))] border-t border-[rgb(var(--border-color))]/20">
              <button
                onClick={() => onClusterClick(center, events)}
                className="w-full px-3 py-2 bg-[rgb(var(--brand))] text-white text-sm font-medium rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
              >
                Zoom to {count} Events
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
