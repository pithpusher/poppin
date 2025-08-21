'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface EnhancedPullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  maxPull?: number;
  className?: string;
}

export default function EnhancedPullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  maxPull = 120,
  className = ""
}: EnhancedPullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const lastHapticTime = useRef<number>(0);

  // Enhanced haptic feedback with different patterns
  const triggerHaptic = useCallback((type: 'pull' | 'threshold' | 'refresh' | 'complete' = 'pull') => {
    if (!('vibrate' in navigator)) return;
    
    const now = Date.now();
    if (now - lastHapticTime.current < 100) return; // Prevent spam
    
    lastHapticTime.current = now;
    
    switch (type) {
      case 'pull':
        // Light vibration for pulling
        navigator.vibrate([10, 20, 10]);
        break;
      case 'threshold':
        // Medium vibration when crossing threshold
        navigator.vibrate([20, 30, 20]);
        break;
      case 'refresh':
        // Strong vibration when refresh starts
        navigator.vibrate([50, 100, 50]);
        break;
      case 'complete':
        // Success pattern
        navigator.vibrate([20, 50, 20, 50, 20]);
        break;
    }
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return; // Only allow pull when at top
    
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    isDragging.current = true;
    setIsPulling(true);
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0) {
      // Pulling down
      const newPullDistance = Math.min(deltaY * 0.6, maxPull);
      setPullDistance(newPullDistance);
      
      // Check if we crossed the threshold
      const wasBelowThreshold = !canRefresh;
      const isAboveThreshold = newPullDistance >= threshold;
      
      if (wasBelowThreshold && isAboveThreshold) {
        setCanRefresh(true);
        triggerHaptic('threshold');
      } else if (wasBelowThreshold && newPullDistance > 20) {
        triggerHaptic('pull');
      }
    }
  }, [isRefreshing, canRefresh, threshold, maxPull, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || isRefreshing) return;
    
    isDragging.current = false;
    setIsPulling(false);
    
    if (canRefresh && pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setCanRefresh(false);
      triggerHaptic('refresh');
      
      try {
        await onRefresh();
        triggerHaptic('complete');
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Reset state
    setPullDistance(0);
    setCanRefresh(false);
  }, [canRefresh, pullDistance, threshold, isRefreshing, onRefresh, triggerHaptic]);

  // Mouse event handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return;
    
    startY.current = e.clientY;
    currentY.current = e.clientY;
    isDragging.current = true;
    setIsPulling(true);
  }, [isRefreshing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || isRefreshing) return;
    
    currentY.current = e.clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0) {
      const newPullDistance = Math.min(deltaY * 0.6, maxPull);
      setPullDistance(newPullDistance);
      
      const wasBelowThreshold = !canRefresh;
      const isAboveThreshold = newPullDistance >= threshold;
      
      if (wasBelowThreshold && isAboveThreshold) {
        setCanRefresh(true);
        triggerHaptic('threshold');
      } else if (wasBelowThreshold && newPullDistance > 20) {
        triggerHaptic('pull');
      }
    }
  }, [isRefreshing, canRefresh, threshold, maxPull, triggerHaptic]);

  const handleMouseUp = useCallback(async () => {
    if (!isDragging.current || isRefreshing) return;
    
    isDragging.current = false;
    setIsPulling(false);
    
    if (canRefresh && pullDistance >= threshold) {
      setIsRefreshing(true);
      setCanRefresh(false);
      triggerHaptic('refresh');
      
      try {
        await onRefresh();
        triggerHaptic('complete');
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanRefresh(false);
  }, [canRefresh, pullDistance, threshold, isRefreshing, onRefresh, triggerHaptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isDragging.current = false;
    };
  }, []);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull-to-Refresh Indicator */}
      <div
        className={`
          absolute top-0 left-0 right-0 z-10 flex items-center justify-center
          transition-all duration-200 ease-out
          ${isPulling ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 60)}px)`,
        }}
      >
        <div className="bg-[rgb(var(--panel))] rounded-full p-3 shadow-lg border border-[rgb(var(--border-color))]/20">
          {isRefreshing ? (
            <ArrowPathIcon className="w-6 h-6 text-[rgb(var(--brand))] animate-spin" />
          ) : (
            <ArrowPathIcon 
              className={`w-6 h-6 text-[rgb(var(--brand))] transition-transform duration-200`}
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isPulling && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--brand))]/20 z-10">
          <div
            className="h-full bg-[rgb(var(--brand))] transition-all duration-200 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Content Container */}
      <div
        ref={containerRef}
        className={`
          transition-transform duration-200 ease-out
          ${isPulling ? 'transition-none' : ''}
        `}
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>

      {/* Pull Hint */}
      {!isPulling && pullDistance === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[rgb(var(--muted))] text-sm pointer-events-none">
          Pull down to refresh
        </div>
      )}

      {/* Refresh Status */}
      {isRefreshing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[rgb(var(--panel))] rounded-lg px-4 py-2 shadow-lg border border-[rgb(var(--border-color))]/20">
          <div className="flex items-center gap-2 text-[rgb(var(--text))]">
            <ArrowPathIcon className="w-4 h-4 text-[rgb(var(--brand))] animate-spin" />
            <span className="text-sm">Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
