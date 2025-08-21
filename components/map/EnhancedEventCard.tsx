'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HeartIcon, ShareIcon, CalendarIcon, ChevronDownIcon, ChevronUpIcon, MapPinIcon, ClockIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
// import { useUser } from '@/lib/user'; // TODO: Implement user authentication

interface EnhancedEventCardProps {
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
  };
  onEventClick?: (eventId: string) => void;
  onDirectionsClick?: (lat: number, lng: number) => void;
}

export default function EnhancedEventCard({ event, onEventClick, onDirectionsClick }: EnhancedEventCardProps) {
  // const { user } = useUser(); // TODO: Implement user authentication
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mock image gallery - in real app, this would come from event data
  const imageGallery = event.image_url ? [event.image_url] : [];
  
  // Add some placeholder images for demo
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
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/e/${event.id}`);
        // Show toast notification
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(event.start_at);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(`Event: ${event.title}\nVenue: ${event.venue_name || 'TBD'}\nMore info: ${window.location.origin}/e/${event.id}`)}&location=${encodeURIComponent(event.venue_name || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleDirections = () => {
    if (event.lat && event.lng && onDirectionsClick) {
      onDirectionsClick(event.lat, event.lng);
    } else if (event.lat && event.lng) {
      window.open(`https://www.google.com/maps?q=${event.lat},${event.lng}`, '_blank');
    }
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageGallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  // Auto-hide quick actions after delay
  useEffect(() => {
    if (showQuickActions) {
      const timer = setTimeout(() => setShowQuickActions(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showQuickActions]);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-xl bg-[rgb(var(--panel))] text-[rgb(var(--text))] shadow-sm hover:shadow-lg transition-all duration-300 border border-[rgb(var(--border-color))]/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Gallery */}
      <div className="relative h-32 overflow-hidden">
        {imageGallery.length > 0 && (
          <>
            <img
              src={imageGallery[currentImageIndex]}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            
            {/* Image Navigation */}
            {imageGallery.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all"
                >
                  <ChevronDownIcon className="w-4 h-4 rotate-90" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all"
                >
                  <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {imageGallery.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        
        {/* Quick Actions Overlay */}
        <div className={`absolute top-2 right-2 flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-all ${
              isLiked 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
            }`}
          >
            {isLiked ? (
              <HeartIconSolid className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:scale-110 transition-all"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleAddToCalendar}
            className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:scale-110 transition-all"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          {event.is_free ? (
            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium bg-green-100 border-green-200 text-green-700">
              Free
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium bg-amber-100 border-amber-200 text-amber-700">
              {formatPrice(event.price_cents)}
            </span>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4">
        {/* Title and Expand Button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold leading-tight flex-1">{event.title}</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-1 hover:bg-[rgb(var(--bg))] rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
            )}
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{formatDate(event.start_at)}</span>
          </div>
          
          {event.venue_name && (
            <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
              <MapPinIcon className="w-3.5 h-3.5" />
              <span>{event.venue_name}</span>
            </div>
          )}
          
          {event.event_type && (
            <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
              <TagIcon className="w-3.5 h-3.5" />
              <span>{event.event_type}</span>
            </div>
          )}
          
          {event.age_restriction && event.age_restriction !== "All Ages" && (
            <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Age: {event.age_restriction}</span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-[rgb(var(--border-color))]/20 pt-3 space-y-3">
            {/* Description placeholder */}
            <p className="text-xs text-[rgb(var(--muted))] leading-relaxed">
              Experience an amazing event filled with excitement and entertainment. 
              Don't miss out on this incredible opportunity to connect with others 
              and create lasting memories.
            </p>
            
            {/* Additional details could go here */}
            <div className="text-xs text-[rgb(var(--muted))]">
              <div className="flex items-center justify-between">
                <span>Organizer</span>
                <span className="font-medium">Event Organizer</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Category</span>
                <span className="font-medium">{event.event_type || 'General'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-[rgb(var(--border-color))]/20">
          <button
            onClick={() => onEventClick?.(event.id)}
            className="flex-1 px-3 py-2 bg-[rgb(var(--brand))] text-white text-xs font-medium rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
          >
            View Details
          </button>
          
          {event.lat && event.lng && (
            <button
              onClick={handleDirections}
              className="px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] text-xs font-medium rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--bg))]/80 transition-colors"
            >
              Directions
            </button>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
}
