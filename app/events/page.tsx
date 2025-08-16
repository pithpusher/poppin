'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, CalendarIcon, ClockIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

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
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const eventTypes = [
    'all',
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

  const dateFilters = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedType, selectedDate]);

  async function loadEvents() {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, title, description, start_at, end_at, venue_name, venue_address,
          image_url, is_free, price_cents, event_type, age_restriction,
          organizers(name)
        `)
        .eq('status', 'approved')
        .gte('start_at', now)
        .order('start_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const eventsWithOrganizer = (data || []).map(event => ({
        ...event,
        organizer_name: event.organizers?.name
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
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedType);
    }

    // Date filter
    if (selectedDate !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthEnd = new Date(today.getFullYear(), now.getMonth() + 1, 0);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_at);
        switch (selectedDate) {
          case 'today':
            return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'week':
            return eventDate >= today && eventDate < weekEnd;
          case 'month':
            return eventDate >= today && eventDate < monthEnd;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--muted))]">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover What's Happening</h1>
          <p className="text-lg text-[rgb(var(--muted))]">Your city's best events, all in one spot.</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
              <input
                type="text"
                placeholder="Search events, venues, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgb(var(--panel))] text-[rgb(var(--text))] token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgb(var(--panel))] text-[rgb(var(--text))] token-border hover:bg-[rgb(var(--bg))] transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Event Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border"
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Date Range
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border"
                  >
                    {dateFilters.map(filter => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-[rgb(var(--muted))]">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <FaceSmileIcon className="w-10 h-10 mx-auto text-[rgb(var(--muted))] mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet.</h3>
            <p className="text-[rgb(var(--muted))] mb-6">Tweak your filters and try again.</p>
            <Link
              href="/events/new"
              className="inline-flex items-center rounded-xl px-6 py-3 bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
            >
              Post Your Event
            </Link>
          </div>
        )}
        {filteredEvents.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-10 h-10 mx-auto text-[rgb(var(--muted))] mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-[rgb(var(--muted))] mb-6">Try adjusting your search or filters to find more events.</p>
            <div className="bg-[rgb(var(--panel))] rounded-xl p-6 max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Hosting something?</h4>
              <p className="text-[rgb(var(--muted))] mb-4">Post it here and get seen by thousands nearby.</p>
              <Link
                href="/events/new"
                className="inline-flex items-center rounded-xl px-4 py-2 bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                Post Your Event
              </Link>
            </div>
          </div>
        )}
        {filteredEvents.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/e/${event.id}`}
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
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Post Event CTA */}
        <div className="text-center mt-16">
          <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
              Have an event to share?
            </h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              Post your event and reach thousands of people in your area.
            </p>
            <Link
              href="/events/new"
              className="inline-flex items-center px-6 py-3 bg-[rgb(var(--brand))] text-white rounded-xl font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
            >
              Post an Event
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
