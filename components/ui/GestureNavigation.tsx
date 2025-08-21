'use client';

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface GestureNavigationProps {
  children: ReactNode[];
  onPageChange?: (pageIndex: number) => void;
  initialPage?: number;
  className?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
  swipeThreshold?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function GestureNavigation({
  children,
  onPageChange,
  initialPage = 0,
  className = "",
  showIndicators = true,
  showNavigation = true,
  swipeThreshold = 50,
  autoPlay = false,
  autoPlayInterval = 5000
}: GestureNavigationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  // Enhanced haptic feedback for navigation
  const triggerHaptic = useCallback((type: 'swipe' | 'pageChange' | 'edge' = 'swipe') => {
    if (!('vibrate' in navigator)) return;
    
    switch (type) {
      case 'swipe':
        // Light vibration for swiping
        navigator.vibrate(10);
        break;
      case 'pageChange':
        // Medium vibration for page change
        navigator.vibrate([20, 30, 20]);
        break;
      case 'edge':
        // Heavy vibration when hitting edge
        navigator.vibrate([50, 100, 50]);
        break;
    }
  }, []);

  // Navigation functions
  const goToPage = useCallback((pageIndex: number, animate: boolean = true) => {
    if (pageIndex < 0 || pageIndex >= children.length || pageIndex === currentPage) return;
    
    if (animate) {
      setIsTransitioning(true);
      triggerHaptic('pageChange');
      
      setTimeout(() => {
        setCurrentPage(pageIndex);
        setIsTransitioning(false);
        onPageChange?.(pageIndex);
      }, 150);
    } else {
      setCurrentPage(pageIndex);
      onPageChange?.(pageIndex);
    }
  }, [currentPage, children.length, onPageChange, triggerHaptic]);

  const goToNextPage = useCallback(() => {
    if (currentPage < children.length - 1) {
      goToPage(currentPage + 1);
    } else {
      triggerHaptic('edge');
    }
  }, [currentPage, children.length, goToPage, triggerHaptic]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    } else {
      triggerHaptic('edge');
    }
  }, [currentPage, goToPage, triggerHaptic]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isTransitioning) return;
    
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = true;
    setIsSwiping(true);
    
    // Pause auto-play when user starts interacting
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, [isTransitioning, autoPlayTimer]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || isTransitioning) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Limit swipe distance
    const maxSwipe = 100;
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    
    setSwipeOffset(clampedDelta);
    
    // Trigger haptic feedback for significant swipes
    if (Math.abs(clampedDelta) > 30 && Math.abs(clampedDelta) % 20 < 5) {
      triggerHaptic('swipe');
    }
  }, [isTransitioning, triggerHaptic]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || isTransitioning) return;
    
    isDragging.current = false;
    setIsSwiping(false);
    
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous page
        goToPreviousPage();
      } else {
        // Swipe left - go to next page
        goToNextPage();
      }
    }
    
    // Reset swipe offset
    setSwipeOffset(0);
    
    // Resume auto-play if enabled
    if (autoPlay) {
      startAutoPlay();
    }
  }, [isTransitioning, swipeThreshold, goToPreviousPage, goToNextPage, autoPlay]);

  // Mouse event handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTransitioning) return;
    
    startX.current = e.clientX;
    currentX.current = e.clientX;
    isDragging.current = true;
    setIsSwiping(true);
    
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, [isTransitioning, autoPlayTimer]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || isTransitioning) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    
    const maxSwipe = 100;
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    
    setSwipeOffset(clampedDelta);
    
    if (Math.abs(clampedDelta) > 30 && Math.abs(clampedDelta) % 20 < 5) {
      triggerHaptic('swipe');
    }
  }, [isTransitioning, triggerHaptic]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || isTransitioning) return;
    
    isDragging.current = false;
    setIsSwiping(false);
    
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        goToPreviousPage();
      } else {
        goToNextPage();
      }
    }
    
    setSwipeOffset(0);
    
    if (autoPlay) {
      startAutoPlay();
    }
  }, [isTransitioning, swipeThreshold, goToPreviousPage, goToNextPage, autoPlay]);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (!autoPlay) return;
    
    autoPlayTimer.current = setTimeout(() => {
      if (currentPage < children.length - 1) {
        goToPage(currentPage + 1, false);
      } else {
        goToPage(0, false);
      }
      startAutoPlay();
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, currentPage, children.length, goToPage]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, []);

  // Start/stop auto-play based on props
  useEffect(() => {
    if (autoPlay) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    
    return () => stopAutoPlay();
  }, [autoPlay, startAutoPlay, stopAutoPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isDragging.current = false;
      stopAutoPlay();
    };
  }, [stopAutoPlay]);

  const totalPages = children.length;
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Navigation Container */}
      <div
        ref={containerRef}
        className={`
          relative flex transition-transform duration-200 ease-out
          ${isSwiping ? 'transition-none' : ''}
        `}
        style={{
          transform: `translateX(calc(-${currentPage * 100}% + ${swipeOffset}px))`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            style={{ width: '100%' }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Page Indicators */}
      {showIndicators && totalPages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === currentPage 
                  ? 'bg-[rgb(var(--brand))] scale-125' 
                  : 'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--muted))]/80'
                }
              `}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {showNavigation && totalPages > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPreviousPage}
            disabled={!canGoPrevious}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full
              transition-all duration-200
              ${canGoPrevious
                ? 'bg-[rgb(var(--panel))] text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]/80 shadow-lg border border-[rgb(var(--border-color))]/20'
                : 'bg-[rgb(var(--panel))]/50 text-[rgb(var(--muted))] cursor-not-allowed'
              }
            `}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNextPage}
            disabled={!canGoNext}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full
              transition-all duration-200
              ${canGoNext
                ? 'bg-[rgb(var(--panel))] text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]/80 shadow-lg border border-[rgb(var(--border-color))]/20'
                : 'bg-[rgb(var(--panel))]/50 text-[rgb(var(--muted))] cursor-not-allowed'
              }
            `}
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Swipe Hint */}
      {!isSwiping && swipeOffset === 0 && totalPages > 1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[rgb(var(--muted))] text-sm pointer-events-none opacity-30">
          Swipe to navigate
        </div>
      )}

      {/* Page Counter */}
      <div className="absolute top-4 right-4 bg-[rgb(var(--panel))] rounded-lg px-2 py-1 text-xs text-[rgb(var(--muted))] border border-[rgb(var(--border-color))]/20">
        {currentPage + 1} / {totalPages}
      </div>
    </div>
  );
}
