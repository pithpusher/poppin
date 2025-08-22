'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon, 
  GlobeAltIcon,
  ShareIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FaceFrownIcon,
  BookmarkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
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
  registration_url: string | null;
  website_url: string | null;
  social_links: string | null;
  organizer_name?: string;
  organizer_email?: string;
  organizer_phone?: string;
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id);
    }
  }, [params.id]);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadEvent(eventId: string) {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          organizers(name, email, phone)
        `)
        .eq('id', eventId)
        .eq('status', 'approved')
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        const eventWithOrganizer = {
          ...data,
          organizer_name: data.organizers?.name,
          organizer_email: data.organizers?.email,
          organizer_phone: data.organizers?.phone
        };
        setEvent(eventWithOrganizer);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function formatPrice(isFree: boolean | null, priceCents: number | null) {
    if (isFree) return 'Free';
    if (priceCents) return `$${(priceCents / 100).toFixed(2)}`;
    return 'Price TBD';
  }

  function shareEvent() {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  }

  function requireAuth(action: string) {
    if (!user) {
      // Show auth prompt
      if (confirm(`Please sign in to ${action}. Would you like to sign in now?`)) {
        window.location.href = '/auth';
      }
      return false;
    }
    return true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <div className="h-5 w-24 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
          </div>

          {/* Event Header Skeleton */}
          <div className="mb-8">
            <div className="h-6 w-20 bg-[rgb(var(--muted))]/20 rounded-full animate-pulse mb-4" />
            <div className="h-8 md:h-10 w-3/4 bg-[rgb(var(--muted))]/20 rounded animate-pulse mb-4" />
            
            {/* Event Meta Skeleton */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Event Image Skeleton */}
          <div className="mb-8">
            <div className="aspect-video w-full bg-[rgb(var(--muted))]/20 rounded-2xl animate-pulse" />
          </div>

          {/* Event Content Skeleton */}
          <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-6 w-32 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-6 w-24 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 space-y-4">
                <div className="h-6 w-32 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="h-5 w-24 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                  <div className="h-5 w-28 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                </div>
              </div>
              
              <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 space-y-4">
                <div className="h-6 w-28 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="h-5 w-32 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                  <div className="h-5 w-36 bg-[rgb(var(--muted))]/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <FaceFrownIcon className="w-12 h-12 mx-auto text-[rgb(var(--muted))] mb-4" />
          <h1 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
            {error || 'Event not found'}
          </h1>
          <p className="text-[rgb(var(--muted))] mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/list"
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
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/list"
            className="inline-flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          >
            ← Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="mb-8">
          {/* Event Type Badge */}
          {event.event_type && (
            <div className="inline-block px-3 py-1 bg-[rgb(var(--brand))] text-white text-sm rounded-full mb-4">
              {event.event_type}
            </div>
          )}

          {/* Event Title */}
          <h1 className="text-xl md:text-2xl font-bold text-[rgb(var(--text))] mb-4">
            {event.title}
          </h1>

          {/* Event Meta */}
          <div className="flex flex-wrap items-center gap-4 text-[rgb(var(--muted))] mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>{formatDate(event.start_at)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>{formatTime(event.start_at)} - {formatTime(event.end_at)}</span>
            </div>

            {event.venue_name && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                <span>{event.venue_name}</span>
              </div>
            )}

            {event.age_restriction && (
              <span className="px-2 py-1 bg-[rgb(var(--bg))] rounded-lg text-sm">
                {event.age_restriction}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (requireAuth('like this event')) {
                  setIsLiked(!isLiked);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-[rgb(var(--panel))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))] token-border'
              }`}
            >
              <HeartIcon className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </button>

            <button
              onClick={shareEvent}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))] token-border transition-colors text-sm font-medium"
            >
              <ShareIcon className="w-5 h-5" />
              Share
            </button>

            <button
              onClick={() => {
                if (requireAuth('save this event')) {
                  // TODO: Implement save functionality
                  alert('Event saved!');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))] token-border transition-colors text-sm font-medium"
            >
              <BookmarkIcon className="w-5 h-5" />
              Save Event
            </button>

            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
              >
                Register Now
              </a>
            )}
          </div>
        </div>

        {/* Event Image */}
        {event.image_url && (
          <div className="mb-8">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Event Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">
                About This Event
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-[rgb(var(--text))] leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">
                Event Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-[rgb(var(--muted))] mt-0.5" />
                  <div>
                    <div className="font-medium text-[rgb(var(--text))]">Date & Time</div>
                    <div className="text-[rgb(var(--muted))]">
                      {formatDate(event.start_at)}<br />
                      {formatTime(event.start_at)} - {formatTime(event.end_at)}
                    </div>
                  </div>
                </div>

                {event.venue_name && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-[rgb(var(--muted))] mt-0.5" />
                    <div>
                      <div className="font-medium text-[rgb(var(--text))]">Venue</div>
                      <div className="text-[rgb(var(--muted))]">
                        {event.venue_name}
                        {event.venue_address && (
                          <div className="text-sm mt-1">{event.venue_address}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-[rgb(var(--muted))] mt-0.5" />
                  <div>
                    <div className="font-medium text-[rgb(var(--text))]">Price</div>
                    <div className="text-[rgb(var(--brand))] font-semibold">
                      {formatPrice(event.is_free, event.price_cents)}
                    </div>
                  </div>
                </div>

                {event.age_restriction && (
                  <div className="flex items-start gap-3">
                    <UserGroupIcon className="w-5 h-5 text-[rgb(var(--muted))] mt-0.5" />
                    <div>
                      <div className="font-medium text-[rgb(var(--text))]">Age Restriction</div>
                      <div className="text-[rgb(var(--muted))]">{event.age_restriction}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Organizer */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-4">
                Contact Organizer
              </h2>
              <div className="space-y-3">
                {event.organizer_name && (
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-[rgb(var(--muted))] mt-0.5" />
                    <div>
                      <div className="font-medium text-[rgb(var(--text))]">
                        {event.organizer_name}
                      </div>
                    </div>
                  </div>
                )}

                {event.organizer_email && (
                  <a
                    href={`mailto:${event.organizer_email}`}
                    className="flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    <span className="text-sm">{event.organizer_email}</span>
                  </a>
                )}

                {event.organizer_phone && (
                  <a
                    href={`tel:${event.organizer_phone}`}
                    className="flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    <span className="text-sm">{event.organizer_phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Info */}
            {event.organizer_name && (
              <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                  Organizer
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-[rgb(var(--text))]">
                        {event.organizer_name}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (requireAuth('follow this organizer')) {
                        // TODO: Implement follow functionality
                        alert('Now following this organizer!');
                      }
                    }}
                    className="w-full px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm mb-3"
                  >
                    Follow Organizer
                  </button>
                  
                  <Link
                    href="/organizer/apply"
                    className="w-full px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors text-sm border border-[rgb(var(--border))] flex items-center justify-center gap-2"
                  >
                    <BuildingOfficeIcon className="w-4 h-4" />
                    Host with Us
                  </Link>

                  {event.organizer_email && (
                    <a
                      href={`mailto:${event.organizer_email}`}
                      className="flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      <span className="text-sm">{event.organizer_email}</span>
                    </a>
                  )}

                  {event.organizer_phone && (
                    <a
                      href={`tel:${event.organizer_phone}`}
                      className="flex items-center gap-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span className="text-sm">{event.organizer_phone}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {event.website_url && (
                  <a
                    href={event.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
                  >
                    <GlobeAltIcon className="w-4 h-4" />
                    Visit Website
                  </a>
                )}

                {event.registration_url && (
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors text-center justify-center"
                  >
                    Register Now
                  </a>
                )}

                <button
                  onClick={shareEvent}
                  className="flex items-center gap-2 w-full px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--bg))]/80 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share Event
                </button>
              </div>
            </div>

            {/* Event Tags */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[rgb(var(--text))] mb-4">
                Event Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.event_type && (
                  <span className="px-3 py-1 bg-[rgb(var(--brand))] text-white text-sm rounded-full">
                    {event.event_type}
                  </span>
                )}
                {event.age_restriction && (
                  <span className="px-3 py-1 bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm rounded-full">
                    {event.age_restriction}
                  </span>
                )}
                <span className="px-3 py-1 bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-sm rounded-full">
                  {formatPrice(event.is_free, event.price_cents)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
              Interested in this event?
            </h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              {event.registration_url 
                ? 'Click the register button above to secure your spot!'
                : 'Contact the organizer for more information and registration details.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={shareEvent}
                className="px-6 py-3 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-xl hover:bg-[rgb(var(--bg))]/80 transition-colors token-border"
              >
                Share Event
              </button>
              <Link
                href="/list"
                className="px-6 py-3 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors"
              >
                Browse More Events
              </Link>
            </div>
          </div>
        </div>

        {/* Host Similar Event CTA */}
        <div className="text-center mt-12">
          <div className="bg-[rgb(var(--panel))] token-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
              Love this event idea?
            </h3>
            <p className="text-[rgb(var(--muted))] mb-6">
              Host your own version and reach your community with Poppin's powerful event management tools
            </p>
            <Link
              href="/organizer/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--brand))] text-white rounded-xl hover:bg-[rgb(var(--brand))]/90 transition-colors font-medium"
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              Host Similar Event
            </Link>
          </div>
        </div>

        {/* Organizer Success Stories */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
              Organizer Success Stories
            </h3>
            <p className="text-[rgb(var(--muted))]">
              See how other organizers are growing their communities
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--text))]">Sarah M.</h4>
                  <p className="text-sm text-[rgb(var(--muted))]">Local Food Festival</p>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                "Poppin helped us reach 3x more attendees and manage our event seamlessly. The analytics are incredible!"
              </p>
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                <span className="font-medium text-[rgb(var(--brand))]">+300%</span>
                <span>attendee growth</span>
              </div>
            </div>

            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--text))]">Mike R.</h4>
                  <p className="text-sm text-[rgb(var(--muted))]">Tech Meetup</p>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                "From 50 to 500 attendees in just 6 months. Poppin's tools made scaling effortless."
              </p>
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                <span className="font-medium text-[rgb(var(--brand))]">+900%</span>
                <span>attendee growth</span>
              </div>
            </div>

            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--text))]">Lisa K.</h4>
                  <p className="text-sm text-[rgb(var(--muted))]">Art Workshop</p>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                "The mobile app and social features helped us build a loyal community of art enthusiasts."
              </p>
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                <span className="font-medium text-[rgb(var(--brand))]">+150%</span>
                <span>repeat attendees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Host with Us CTA */}
        <div className="text-center mt-12">
          <div className="bg-[rgb(var(--brand))] rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to start your journey?
            </h3>
            <p className="text-white/90 mb-6">
              Join thousands of organizers who are already using Poppin to reach their communities
            </p>
            <Link
              href="/organizer/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[rgb(var(--brand))] rounded-xl hover:bg-white/90 transition-colors font-medium"
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              Host with Us
            </Link>
          </div>
        </div>

        {/* Browse Similar Events */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[rgb(var(--text))] mb-4">
              Similar Events You Might Like
            </h3>
            <p className="text-[rgb(var(--muted))]">
              Discover more events in your area
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Placeholder for similar events */}
            <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-6 text-center">
              <CalendarIcon className="w-12 h-12 text-[rgb(var(--muted))] mx-auto mb-4" />
              <p className="text-[rgb(var(--muted))] text-sm">
                Similar events will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="pb-16"></div>
    </div>
  );
}
