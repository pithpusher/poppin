'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HeartIcon, BookmarkIcon, ShareIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface SwipeableEventCardProps {
  event: {
    id: string;
    title: string;
    start_at: string;
    venue_name: string | null;
    image_url: string | null;
    is_free?: boolean | null;
    price_cents?: number | null;
    event_type?: string | null;
  };
  onLike?: (eventId: string) => void;
  onSave?: (eventId: string) => void;
  onShare?: (event: any) => void;
  onAddToCalendar?: (event: any) => void;
  onViewDetails?: (eventId: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function SwipeableEventCard({
  event,
  onLike,
  onSave,
  onShare,
  onAddToCalendar,
  onViewDetails,
  isLiked = false,
  isSaved = false
}: SwipeableEventCardProps) {
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [isSavedState, setIsSavedState] = useState(isSaved);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
      }
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = true;
    setIsSwiping(true);
    setShowActions(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Limit swipe distance
    const maxSwipe = 120;
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    
    setSwipeOffset(clampedDelta);
    
    // Show actions when swiping far enough
    if (Math.abs(clampedDelta) > 60) {
      setShowActions(true);
    } else {
      setShowActions(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    setIsSwiping(false);
    
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > 80) {
      // Trigger action based on swipe direction
      if (deltaX > 0) {
        // Swipe right - Like
        handleLike();
        triggerHaptic('medium');
      } else {
        // Swipe left - Save
        handleSave();
        triggerHaptic('medium');
      }
    }
    
    // Reset position
    setSwipeOffset(0);
    setShowActions(false);
  };

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = e.clientX;
    isDragging.current = true;
    setIsSwiping(true);
    setShowActions(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    
    const maxSwipe = 120;
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    
    setSwipeOffset(clampedDelta);
    
    if (Math.abs(clampedDelta) > 60) {
      setShowActions(true);
    } else {
      setShowActions(false);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    setIsSwiping(false);
    
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > 80) {
      if (deltaX > 0) {
        handleLike();
        triggerHaptic('medium');
      } else {
        handleSave();
        triggerHaptic('medium');
      }
    }
    
    setSwipeOffset(0);
    setShowActions(false);
  };

  // Action handlers
  const handleLike = () => {
    setIsLikedState(!isLikedState);
    onLike?.(event.id);
    triggerHaptic('light');
  };

  const handleSave = () => {
    setIsSavedState(!isSavedState);
    onSave?.(event.id);
    triggerHaptic('light');
  };

  const handleShare = () => {
    onShare?.(event);
    triggerHaptic('light');
  };

  const handleAddToCalendar = () => {
    onAddToCalendar?.(event);
    triggerHaptic('light');
  };

  const handleCardClick = () => {
    onViewDetails?.(event.id);
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

  return (
    <div className="relative overflow-hidden">
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        {/* Right side - Like action */}
        <div className="flex-1 bg-green-500 flex items-center justify-center">
          <HeartIcon className="w-8 h-8 text-white" />
        </div>
        {/* Left side - Save action */}
        <div className="flex-1 bg-blue-500 flex items-center justify-center">
          <BookmarkIcon className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        className={`
          relative bg-[rgb(var(--panel))] rounded-xl border border-[rgb(var(--border-color))]/20 
          shadow-lg overflow-hidden cursor-pointer select-none
          transition-transform duration-200 ease-out
          ${isSwiping ? 'transition-none' : ''}
        `}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCardClick}
      >
        {/* Event Image */}
        <div className="relative h-48 bg-gradient-to-br from-[rgb(var(--brand))]/20 to-[rgb(var(--brand))]/40">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPinIcon className="w-16 h-16 text-[rgb(var(--brand))]" />
            </div>
          )}
          
          {/* Action Indicators */}
          {showActions && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="text-white text-center">
                {swipeOffset > 0 ? (
                  <div className="flex items-center gap-2">
                    <HeartIcon className="w-8 h-8" />
                    <span className="text-lg font-semibold">Like</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BookmarkIcon className="w-8 h-8" />
                    <span className="text-lg font-semibold">Save</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Event Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2 line-clamp-2">
            {event.title}
          </h3>
          
          <div className="space-y-2 text-sm text-[rgb(var(--muted))] mb-4">
            <div className="flex items-center gap-2">
              <span>🕒</span>
              <span>{formatDate(event.start_at)}</span>
            </div>
            {event.venue_name && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className={`p-2 rounded-full transition-colors ${
                  isLikedState 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-[rgb(var(--bg))] text-[rgb(var(--muted))] hover:bg-red-50'
                }`}
              >
                {isLikedState ? (
                  <HeartIconSolid className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className={`p-2 rounded-full transition-colors ${
                  isSavedState 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-[rgb(var(--bg))] text-[rgb(var(--muted))] hover:bg-blue-50'
                }`}
              >
                {isSavedState ? (
                  <BookmarkIconSolid className="w-5 h-5" />
                ) : (
                  <BookmarkIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="p-2 rounded-full bg-[rgb(var(--bg))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg))]/80 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCalendar();
                }}
                className="p-2 rounded-full bg-[rgb(var(--bg))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg))]/80 transition-colors"
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Swipe Hint */}
        {!isSwiping && swipeOffset === 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-white/60 text-sm">
              ← Save
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/60 text-sm">
              Like →
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
