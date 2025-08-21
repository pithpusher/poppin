"use client";

import { useState, useEffect } from 'react';
import { FireIcon, EyeIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

export interface PopularEvent {
  id: string;
  title: string;
  start_at: string;
  venue_name: string | null;
  image_url: string | null;
  event_type: string | null;
  is_free: boolean | null;
  price_cents: number | null;
  view_count: number;
  created_at: string;
}

interface PopularEventsProps {
  onEventClick: (eventId: string) => void;
  currentLocation?: { lat: number; lng: number } | null;
}

export default function PopularEvents({ onEventClick, currentLocation }: PopularEventsProps) {
  const [popularEvents, setPopularEvents] = useState<PopularEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    if (isModalOpen) {
      loadPopularEvents();
    }
  }, [isModalOpen, selectedTimeframe]);

  const loadPopularEvents = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('events')
        .select('id, title, start_at, venue_name, image_url, event_type, is_free, price_cents, view_count, created_at')
        .eq('status', 'approved')
        .not('view_count', 'is', null)
        .order('view_count', { ascending: false })
        .limit(10);

      // Add time filtering
      const now = new Date();
      if (selectedTimeframe === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query.gte('start_at', today.toISOString()).lt('start_at', tomorrow.toISOString());
      } else if (selectedTimeframe === 'week') {
        const weekFromNow = new Date(now);
        weekFromNow.setDate(now.getDate() + 7);
        query = query.gte('start_at', now.toISOString()).lte('start_at', weekFromNow.toISOString());
      } else if (selectedTimeframe === 'month') {
        const monthFromNow = new Date(now);
        monthFromNow.setMonth(now.getMonth() + 1);
        query = query.gte('start_at', now.toISOString()).lte('start_at', monthFromNow.toISOString());
      }

      // Add location filtering if available
      if (currentLocation) {
        // Simple radius search (you might want to implement proper geospatial queries)
        query = query.not('lat', 'is', null).not('lng', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPopularEvents(data || []);
    } catch (error) {
      console.error('Error loading popular events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const formatPrice = (isFree: boolean | null, priceCents: number | null) => {
    if (isFree) return 'Free';
    if (priceCents) return `$${(priceCents / 100).toFixed(2)}`;
    return 'Price TBD';
  };

  const timeframes = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[rgb(var(--brand))] text-white rounded-md hover:opacity-90 transition-all shadow-sm hover:shadow-md text-xs"
      >
        <FireIcon className="w-3.5 h-3.5" />
        <span className="font-medium">Popular</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-3">
                                 <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
                   <FireIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                   Popular Events
                 </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Timeframe Selector */}
              <div className="flex gap-2">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe.value}
                    onClick={() => setSelectedTimeframe(timeframe.value as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTimeframe === timeframe.value
                        ? 'bg-[rgb(var(--brand))] text-white'
                        : 'bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--muted))]'
                    }`}
                  >
                    {timeframe.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-[rgb(var(--muted))]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
                  <p className="mt-2">Loading popular events...</p>
                </div>
              ) : popularEvents.length === 0 ? (
                <div className="text-center py-8 text-[rgb(var(--muted))]">
                  <FireIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No popular events found for this timeframe</p>
                </div>
              ) : (
                popularEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => onEventClick(event.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Popularity Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-[rgb(var(--muted))] text-[rgb(var(--text))]'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>

                      {/* Event Image */}
                      <div className="flex-shrink-0">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-[rgb(var(--text))] opacity-50" />
                          </div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[rgb(var(--text))] mb-1 line-clamp-2">
                          {event.title}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted))] mb-2">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(event.start_at)}
                          </span>
                          {event.venue_name && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              {event.venue_name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs">
                            {event.event_type && (
                              <span className="px-2 py-1 bg-[rgb(var(--muted))] text-[rgb(var(--text))] rounded-full">
                                {event.event_type}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-green-600 text-white rounded-full font-medium">
                              {formatPrice(event.is_free, event.price_cents)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-[rgb(var(--muted))]">
                            <EyeIcon className="w-3 h-3" />
                            {event.view_count || 0} views
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
