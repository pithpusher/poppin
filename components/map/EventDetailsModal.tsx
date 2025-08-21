'use client';

import React, { useState } from 'react';
import { XMarkIcon, HeartIcon, ShareIcon, CalendarIcon, MapPinIcon, ClockIcon, UserIcon, TagIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
// import { useUser } from '@/lib/user'; // TODO: Implement user authentication

interface EventDetailsModalProps {
  event: {
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDirectionsClick?: (lat: number, lng: number) => void;
}

export default function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onDirectionsClick 
}: EventDetailsModalProps) {
  // const { user } = useUser(); // TODO: Implement user authentication
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!event || !isOpen) return null;

  // Mock image gallery - in real app, this would come from event data
  const imageGallery = event.image_url ? [event.image_url] : [];
  if (imageGallery.length === 0) {
    imageGallery.push('/placeholder-event-1.svg', '/placeholder-event-2.svg', '/placeholder-event-3.svg');
  }

  const handleLike = async () => {
    // if (!user) {
    //   // Show login prompt or redirect to auth
    //   return;
    // }
    
    try {
      // TODO: Implement like/unlike API call
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: `${window.location.origin}/e/${event.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/e/${event.id}`);
        // Show toast notification
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(event.start_at);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(`Event: ${event.title}\nVenue: ${event.venue_name || 'TBD'}\nMore info: ${window.location.origin}/e/${event.id}`)}&location=${encodeURIComponent(event.venue_name || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleDirections = () => {
    if (event.lat && event.lng && onDirectionsClick) {
      onDirectionsClick(event.lat, event.lng);
      onClose();
    } else if (event.lat && event.lng) {
      window.open(`https://www.google.com/maps?q=${event.lat},${event.lng}`, '_blank');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatPrice = (priceCents: number | null) => {
    if (!priceCents) return 'Free';
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageGallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[rgb(var(--text))] mb-2">{event.title}</h2>
              <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted))]">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDate(event.start_at)}</span>
                </div>
                {event.venue_name && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{event.venue_name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-all ${
                  isLiked 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80'
                }`}
              >
                {isLiked ? (
                  <HeartIconSolid className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80 transition-all"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80 transition-all"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Image Gallery */}
          {imageGallery.length > 0 && (
            <div className="relative h-64 overflow-hidden rounded-xl">
              <img
                src={imageGallery[currentImageIndex]}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              
              {imageGallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                  >
                    <div className="w-4 h-4 border-l-2 border-t-2 border-white rotate-[-45deg] ml-1" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                  >
                    <div className="w-4 h-4 border-r-2 border-t-2 border-white rotate-45" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {imageGallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">Event Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TagIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text))]">Category</p>
                      <p className="text-sm text-[rgb(var(--muted))]">{event.event_type || 'General'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text))]">Age Restriction</p>
                      <p className="text-sm text-[rgb(var(--muted))]">{event.age_restriction || 'All Ages'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-[rgb(var(--muted))] flex items-center justify-center">
                      <span className="text-lg">💰</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text))]">Price</p>
                      <p className="text-sm text-[rgb(var(--muted))]">{formatPrice(event.price_cents)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">Venue Details</h3>
                <div className="space-y-3">
                  {event.venue_name && (
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text))]">Location</p>
                        <p className="text-sm text-[rgb(var(--muted))]">{event.venue_name}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text))]">Contact</p>
                      <p className="text-sm text-[rgb(var(--muted))]">Event Organizer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <GlobeAltIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text))]">Website</p>
                      <a 
                        href={`/e/${event.id}`} 
                        className="text-sm text-[rgb(var(--brand))] hover:underline"
                      >
                        View Event Page
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">About This Event</h3>
            <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
              Experience an amazing event filled with excitement and entertainment. 
              Don't miss out on this incredible opportunity to connect with others 
              and create lasting memories. This event promises to be a memorable 
              experience for all attendees.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[rgb(var(--border-color))]/20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCalendar}
              className="flex-1 px-4 py-3 bg-[rgb(var(--brand))] text-white font-medium rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              Add to Calendar
            </button>
            
            {event.lat && event.lng && (
              <button
                onClick={handleDirections}
                className="px-4 py-3 bg-[rgb(var(--bg))] text-[rgb(var(--text))] font-medium rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--bg))]/80 transition-colors flex items-center justify-center gap-2"
              >
                <MapPinIcon className="w-5 h-5" />
                Directions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
