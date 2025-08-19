'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, CalendarIcon, ClockIcon, FaceSmileIcon, HeartIcon, ShareIcon, MapIcon, PlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { tokens } from '@/components/tokens';

type Event = {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  venue_name: string | null;
  venue_address: string | null;
  image_url: string | null;
  is_free: boolean | null;
  price_cents: number | null;
  event_type: string | null;
  age_restriction: string | null;
  organizer_name?: string;
  lat?: number | null;
  lng?: number | null;
};

type Range = "today" | "week" | "month" | "all";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [range, setRange] = useState<Range>("all");
  const [onlyFree, setOnlyFree] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [ageRestriction, setAgeRestriction] = useState<string>("All Ages");
  const [showFilters, setShowFilters] = useState(false);

  const eventTypeOptions = [
    'Music',
    'Food & Drink',
    'Nightlife',
    'Family & Kids',
    'Arts & Culture',
    'Community & Causes',
    'Education & Workshops',
    'Sports & Recreation',
    'Shopping & Sales'
  ];

  const ageOptions = [
    'All Ages',
    '18+',
    '21+'
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, range, onlyFree, startDate, endDate, eventTypes, ageRestriction]);

  async function loadEvents() {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, title, description, start_at, end_at, venue_name, venue_address,
          image_url, is_free, price_cents, event_type, age_restriction,
          organizers(name), lat, lng
        `)
        .eq('status', 'approved')
        .gte('start_at', now)
        .order('start_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const eventsWithOrganizer = (data || []).map(event => ({
        ...event,
        organizer_name: event.organizers && Array.isArray(event.organizers) && event.organizers.length > 0 
          ? event.organizers[0].name 
          : event.organizers?.name || 'Unknown'
      }));

      setEvents(eventsWithOrganizer);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterEvents() {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.venue_name?.toLowerCase().includes(term) ||
        event.event_type?.toLowerCase().includes(term)
      );
    }

    // Date range filter
    if (range !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (range) {
        case "today":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.start_at);
            return eventDate >= today && eventDate < tomorrow;
          });
          break;
        case "week":
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.start_at);
            return eventDate >= today && eventDate < nextWeek;
          });
          break;
        case "month":
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.start_at);
            return eventDate >= today && eventDate < nextMonth;
          });
          break;
      }
    }

    // Custom date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return eventDate >= start && eventDate <= end;
      });
    }

    // Free events filter
    if (onlyFree) {
      filtered = filtered.filter(event => event.is_free);
    }

    // Event type filter
    if (eventTypes.length > 0) {
      filtered = filtered.filter(event => 
        event.event_type && eventTypes.includes(event.event_type)
      );
    }

    // Age restriction filter
    if (ageRestriction !== "All Ages") {
      filtered = filtered.filter(event => 
        event.age_restriction === ageRestriction
      );
    }

    setFilteredEvents(filtered);
  }

  function clearFilters() {
    setSearchTerm('');
    setRange("all");
    setOnlyFree(false);
    setStartDate(null);
    setEndDate(null);
    setEventTypes([]);
    setAgeRestriction("All Ages");
  }

  function toggleEventType(type: string) {
    setEventTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function formatPrice(isFree: boolean | null, priceCents: number | null) {
    if (isFree) return 'Free';
    if (priceCents) return `$${(priceCents / 100).toFixed(2)}`;
    return 'Price TBD';
  }

  function getMapUrl(event: Event) {
    if (event.lat && event.lng) {
      return `/map?lat=${event.lat}&lng=${event.lng}&query=${encodeURIComponent(event.title)}`;
    }
    return '/map';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--muted))]">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 md:py-12 lg:py-16 px-4">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <FaceSmileIcon className="w-16 h-16 md:w-20 md:h-20 text-[rgb(var(--brand))] mx-auto mb-4 md:mb-6" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">Discover What&apos;s Happening</h1>
          <p className={`text-base sm:text-lg md:text-xl ${tokens.muted} max-w-2xl md:max-w-3xl mx-auto`}>Your city's best events, all in one spot.</p>
        </div>

        {/* Header with Search and Filters */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 md:py-4 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-lg token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] text-sm md:text-base"
                />
              </div>
            </div>
            
            <div className="flex gap-3 md:gap-4">
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[rgb(var(--brand))] text-white rounded-xl text-sm md:text-base font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />
                Post Event
              </Link>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-medium transition-colors ${
                  showFilters 
                    ? 'bg-[rgb(var(--brand))] text-white' 
                    : 'bg-[rgb(var(--panel))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))] hover:bg-[rgb(var(--bg))]'
                }`}
              >
                <FunnelIcon className="w-4 h-4 md:w-5 md:h-5" />
                Filters
              </button>
              
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[rgb(var(--panel))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))] rounded-xl text-sm md:text-base font-medium hover:bg-[rgb(var(--bg))] transition-colors"
              >
                <MapIcon className="w-4 h-4 md:w-5 md:h-5" />
                Map View
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-[rgb(var(--panel))] token-border rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">Date Range</label>
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as Range)}
                    className="w-full px-3 py-2 border border-[rgb(var(--border-color))] rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Custom Date Range */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">Custom Start Date</label>
                  <input
                    type="date"
                    value={startDate || ''}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[rgb(var(--border-color))] rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">Custom End Date</label>
                  <input
                    type="date"
                    value={endDate || ''}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[rgb(var(--border-color))] rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  />
                </div>

                {/* Free Events Toggle */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text))] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyFree}
                      onChange={(e) => setOnlyFree(e.target.checked)}
                      className="rounded border-[rgb(var(--border-color))] text-[rgb(var(--brand))] focus:ring-[rgb(var(--brand))]"
                    />
                    Free Events Only
                  </label>
                </div>
              </div>

              {/* Event Types */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">Event Types</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypeOptions.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleEventType(type)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        eventTypes.includes(type)
                          ? 'bg-[rgb(var(--brand))] text-white'
                          : 'bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))] hover:bg-[rgb(var(--panel))]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Restriction */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">Age Restriction</label>
                <select
                  value={ageRestriction}
                  onChange={(e) => setAgeRestriction(e.target.value)}
                  className="px-3 py-2 border border-[rgb(var(--border-color))] rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                >
                  {ageOptions.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-[rgb(var(--muted))]">
            {loading ? 'Loading...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
          </div>
          
          {/* Post Event Button */}
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Post Event
          </Link>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--brand))] mx-auto mb-4"></div>
            <p className="text-[rgb(var(--muted))]">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <FaceSmileIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">No events found</h3>
            <p className={`text-base sm:text-lg ${tokens.muted} mb-6 max-w-2xl mx-auto`}>
              Try adjusting your filters or search terms to find more events.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
              >
                Clear Filters
              </button>
              <Link
                href="/events/new"
                className="px-4 py-2 border border-[rgb(var(--border-color))] text-[rgb(var(--text))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--panel))] transition-colors"
              >
                Post an Event
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group block bg-[rgb(var(--panel))] token-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Event Image */}
                <div className="aspect-video bg-[rgb(var(--bg))] overflow-hidden">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted))]">
                      <CalendarIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Event Content */}
                <div className="p-4">
                  {/* Event Type Badge */}
                  {event.event_type && (
                    <div className="inline-block px-2 py-1 bg-[rgb(var(--brand))] text-white text-xs rounded-full mb-2">
                      {event.event_type}
                    </div>
                  )}

                  {/* Event Title */}
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2 group-hover:text-[rgb(var(--brand))] transition-colors">
                    {event.title}
                  </h3>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(event.start_at)}</span>
                    </div>
                    
                    {event.venue_name && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{event.venue_name}</span>
                      </div>
                    )}

                    {event.organizer_name && (
                      <div className="flex items-center gap-2">
                        <span>by {event.organizer_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-3 pt-3 border-t border-[rgb(var(--border-color))]/20">
                    <span className="text-lg font-semibold text-[rgb(var(--brand))]">
                      {formatPrice(event.is_free, event.price_cents)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[rgb(var(--border-color))]/20">
                    <Link
                      href={`/e/${event.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Details
                    </Link>
                    
                    <Link
                      href={getMapUrl(event)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--panel))] transition-colors text-sm font-medium"
                    >
                      <MapIcon className="w-4 h-4" />
                      Map
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Event CTA */}
        <div className="text-center mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">Have events to share?</h2>
          <p className={`text-base sm:text-lg ${tokens.muted} mb-6 max-w-2xl mx-auto`}>
            Post it here and get seen by thousands nearby.
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            Post an Event
          </Link>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
