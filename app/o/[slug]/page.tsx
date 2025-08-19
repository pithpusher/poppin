'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPinIcon, 
  GlobeAltIcon, 
  CalendarIcon, 
  UserIcon,
  BuildingOfficeIcon,
  StarIcon,
  FaceFrownIcon,
  CameraIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { tokens } from '@/components/tokens';

type Organizer = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  } | null;
  verified: boolean;
  created_at: string;
};

type OrganizerEvent = {
  id: string;
  title: string;
  start_at: string;
  image_url: string | null;
  is_free: boolean | null;
  price_cents: number | null;
  venue_name: string | null;
  event_type: string | null;
};

export default function OrganizerDetailPage() {
  const params = useParams<{ slug: string }>();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      loadOrganizerData(params.slug);
    }
  }, [params.slug]);

  async function loadOrganizerData(slug: string) {
    try {
      setLoading(true);
      setError(null);

      // Get organizer details
      const { data: organizerData, error: organizerError } = await supabase
        .from('organizers')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (organizerError) throw organizerError;

      if (organizerData) {
        setOrganizer(organizerData);
        
        // Get organizer's events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title, start_at, image_url, is_free, price_cents, venue_name, event_type')
          .eq('organizer_id', organizerData.id)
          .eq('status', 'approved')
          .gte('start_at', new Date().toISOString())
          .order('start_at', { ascending: true })
          .limit(20);

        if (eventsError) throw eventsError;
        setEvents(eventsData || []);
      } else {
        setError('Organizer not found');
      }
    } catch (err) {
      console.error('Error loading organizer data:', err);
      setError('Failed to load organizer information');
    } finally {
      setLoading(false);
    }
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
            <p className="mt-4 text-[rgb(var(--muted))]">Loading organizer...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <FaceFrownIcon className="w-12 h-12 mx-auto text-[rgb(var(--muted))] mb-4" />
          <h1 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
            {error || 'Organizer not found'}
          </h1>
          <p className="text-[rgb(var(--muted))] mb-6">
            The organizer you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          >
            ← Back to Events
          </Link>
        </div>

        {/* Organizer Header */}
        <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center flex-shrink-0">
              {organizer.avatar_url ? (
                <img
                  src={organizer.avatar_url}
                  alt={organizer.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <BuildingOfficeIcon className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Organizer Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))]">
                  {organizer.name}
                </h1>
                {organizer.verified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    <StarIcon className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>

              {organizer.bio && (
                <p className={`text-base sm:text-lg ${tokens.muted} mb-4 leading-relaxed`}>
                  {organizer.bio}
                </p>
              )}

              {/* Follow Button */}
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors mb-4">
                <UserIcon className="w-5 h-5" />
                Follow Organizer
              </button>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-[rgb(var(--muted))]">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{events.length} upcoming events</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Member since {new Date(organizer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Website */}
        {(organizer.website_url || organizer.socials) && (
          <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">
              Connect with {organizer.name}
            </h2>
            <div className="flex flex-wrap gap-4">
              {organizer.website_url && (
                <a
                  href={organizer.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border text-sm font-medium"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  Website
                </a>
              )}
              
              {organizer.socials?.instagram && (
                <a
                  href={organizer.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border text-sm font-medium"
                >
                  <CameraIcon className="w-4 h-4" /> Instagram
                </a>
              )}
              
              {organizer.socials?.facebook && (
                <a
                  href={organizer.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border text-sm font-medium"
                >
                  <BookOpenIcon className="w-4 h-4" /> Facebook
                </a>
              )}
              
              {organizer.socials?.twitter && (
                <a
                  href={organizer.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border text-sm font-medium"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" /> Twitter
                </a>
              )}
              
              {organizer.socials?.linkedin && (
                <a
                  href={organizer.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border text-sm font-medium"
                >
                  <BriefcaseIcon className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        )}

        {/* Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[rgb(var(--text))]">
              Upcoming Events by {organizer.name}
            </h2>
            <Link
              href="/events"
              className="text-[rgb(var(--brand))] hover:underline font-medium"
            >
              View All Events
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 bg-[rgb(var(--panel))] token-border rounded-xl">
              <CalendarIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                No upcoming events
              </h3>
              <p className="text-[rgb(var(--muted))]">
                {organizer.name} doesn't have any upcoming events at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
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
                    </div>

                    {/* Price */}
                    <div className="mt-3 pt-3 border-t border-[rgb(var(--border-color))]/20">
                      <span className="text-lg font-semibold text-[rgb(var(--brand))]">
                        {formatPrice(event.is_free, event.price_cents)}
                      </span>
                    </div>

                    {/* Get Notified Button */}
                    <button className="mt-4 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors token-border w-full">
                      Get Notified
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
              Interested in this organizer's events?
            </h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              Follow them on social media or visit their website to stay updated on future events.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/events"
                className="px-6 py-3 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors"
              >
                Browse All Events
              </Link>
              <Link
                href="/organizer/apply"
                className="px-6 py-3 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border"
              >
                Become an Organizer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
