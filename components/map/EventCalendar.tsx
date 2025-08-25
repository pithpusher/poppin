'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { tokens } from '@/components/tokens';

interface Event {
  id: string;
  title: string;
  start_at: string;
  venue_name: string | null;
  image_url: string | null;
  is_free?: boolean | null;
  event_type?: string | null;
  age_restriction?: string | null;
}

interface EventCalendarProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  selectedDate?: Date | null;
  selectedDateRange?: { start: Date | null; end: Date | null };
  onDateSelect?: (date: Date) => void;
  onDateRangeSelect?: (start: Date, end: Date) => void;
  onViewModeChange?: (viewMode: 'month' | 'week') => void;
  className?: string;
}

export default function EventCalendar({ 
  events, 
  onEventClick, 
  selectedDate, 
  selectedDateRange,
  onDateSelect,
  onDateRangeSelect,
  onViewModeChange,
  className = "" 
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Use selectedDateRange from props if available, otherwise use local state
  const effectiveStart = selectedDateRange?.start || selectionStart;
  const effectiveEnd = selectedDateRange?.end || selectionEnd;

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  }, [currentMonth]);

  // Generate calendar days for current week
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  }, [currentWeek]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    
    events.forEach(event => {
      const eventDate = new Date(event.start_at);
      const dateKey = eventDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [events]);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev);
      newWeek.setDate(prev.getDate() - 7);
      return newWeek;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev);
      newWeek.setDate(prev.getDate() + 7);
      return newWeek;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    setCurrentWeek(today);
    if (onDateSelect) {
      onDateSelect(today);
    }
  }, [onDateSelect]);

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  // Check if date is in current week
  const isCurrentWeek = (date: Date) => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return date >= weekStart && date <= weekEnd;
  };

  // Check if date is in selection range
  const isInSelectionRange = (date: Date) => {
    if (!effectiveStart || !effectiveEnd) return false;
    
    const dateTime = date.getTime();
    const startTime = Math.min(effectiveStart.getTime(), effectiveEnd.getTime());
    const endTime = Math.max(effectiveStart.getTime(), effectiveEnd.getTime());
    
    return dateTime >= startTime && dateTime <= endTime;
  };

  // Check if date is selection start or end
  const isSelectionBoundary = (date: Date) => {
    if (!effectiveStart || !effectiveEnd) return false;
    return date.toDateString() === effectiveStart.toDateString() || 
           date.toDateString() === effectiveEnd.toDateString();
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.getDate();
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate[dateKey] || [];
  };

  // Handle date selection start
  const handleDateMouseDown = useCallback((date: Date) => {
    setSelectionStart(date);
    setSelectionEnd(date);
    setIsSelecting(true);
    
    if (onDateSelect) {
      onDateSelect(date);
    }
  }, [onDateSelect]);

  // Handle date selection during drag
  const handleDateMouseEnter = useCallback((date: Date) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd(date);
    }
  }, [isSelecting, selectionStart]);

  // Handle date selection end
  const handleDateMouseUp = useCallback((date: Date) => {
    if (isSelecting && selectionStart && selectionEnd) {
      const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
      const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;
      
      if (onDateRangeSelect && start.toDateString() !== end.toDateString()) {
        onDateRangeSelect(start, end);
      } else if (onDateSelect) {
        onDateSelect(date);
      }
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, onDateRangeSelect, onDateSelect]);

  // Handle single date click
  const handleDateClick = useCallback((date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  }, [onDateSelect]);

  // Get selected date range text
  const getSelectedRangeText = () => {
    if (!effectiveStart || !effectiveEnd) return '';
    
    if (effectiveStart.toDateString() === effectiveEnd.toDateString()) {
      return effectiveStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    const start = effectiveStart < effectiveEnd ? effectiveStart : effectiveEnd;
    const end = effectiveStart < effectiveEnd ? effectiveEnd : effectiveStart;
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Get current view title
  const getViewTitle = () => {
    if (viewMode === 'week') {
      const weekStart = new Date(currentWeek);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else {
      return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Handle view mode toggle
  const handleViewModeToggle = useCallback(() => {
    if (viewMode === 'month') {
      setViewMode('week');
      setCurrentWeek(currentMonth);
    } else {
      setViewMode('month');
      setCurrentMonth(currentWeek);
    }
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, currentMonth, currentWeek, onViewModeChange]);

  // Render calendar day
  const renderCalendarDay = (date: Date, index: number) => {
    const dayEvents = getEventsForDate(date);
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const inRange = isInSelectionRange(date);
    const isBoundary = isSelectionBoundary(date);
    const isCurrent = viewMode === 'month' ? isCurrentMonth(date) : isCurrentWeek(date);
    
    return (
      <div
        key={index}
        onMouseDown={() => handleDateMouseDown(date)}
        onMouseEnter={() => handleDateMouseEnter(date)}
        onMouseUp={() => handleDateMouseUp(date)}
        onClick={() => handleDateClick(date)}
        className={`
          p-2 border border-[rgb(var(--border-color))]/10 rounded-lg cursor-pointer transition-all
          ${isToday(date) ? 'bg-[rgb(var(--brand))]/10 border-[rgb(var(--brand))]/30' : ''}
          ${isSelected ? 'ring-2 ring-[rgb(var(--brand))] ring-opacity-50' : ''}
          ${inRange ? 'bg-[rgb(var(--brand))]/20 border-[rgb(var(--brand))]/40' : ''}
          ${isBoundary ? 'ring-2 ring-[rgb(var(--brand))] ring-opacity-70' : ''}
          ${!isCurrent ? 'opacity-40' : ''}
          hover:bg-[rgb(var(--bg))] hover:border-[rgb(var(--border-color))]/30
        `}
      >
        {/* Date Number and Event Icon */}
        <div className="flex items-center justify-between">
          <div className={`
            text-sm font-medium
            ${isToday(date) ? 'text-[rgb(var(--brand))]' : 'text-[rgb(var(--text))]'}
            ${inRange ? 'text-[rgb(var(--brand))]' : ''}
            ${!isCurrent ? 'text-[rgb(var(--muted))]' : ''}
          `}>
            {formatDate(date)}
          </div>
          
          {/* Event Icon (Mobile) */}
          {dayEvents.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[rgb(var(--brand))] rounded-full"></div>
              {dayEvents.length > 1 && (
                <span className="text-xs text-[rgb(var(--muted))] hidden sm:block">
                  {dayEvents.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Event Titles (Desktop Only) */}
        <div className="hidden md:block space-y-1 mt-1">
          {dayEvents.slice(0, 3).map((event, eventIndex) => (
            <div
              key={event.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event.id);
              }}
              className="
                text-xs p-1 rounded truncate cursor-pointer
                bg-[rgb(var(--brand))]/20 text-[rgb(var(--brand))] 
                hover:bg-[rgb(var(--brand))]/30 transition-colors
                border border-[rgb(var(--brand))]/30
              "
              title={event.title}
            >
              {event.title}
            </div>
          ))}
          
          {dayEvents.length > 3 && (
            <div className="text-xs text-[rgb(var(--muted))] text-center">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 ${className}`}>
      {/* Calendar Header */}
      <div className="p-4 border-b border-[rgb(var(--border-color))]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-[rgb(var(--brand))]" />
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
              {getViewTitle()}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewModeToggle}
              className="px-3 py-1.5 text-sm bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--muted))]/10 transition-colors"
            >
              {viewMode === 'month' ? 'Week' : 'Month'}
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
        
        {/* Navigation with Date Range Display */}
        <div className="flex items-center justify-between">
          <button
            onClick={viewMode === 'month' ? goToPreviousMonth : goToPreviousWeek}
            className="p-2 hover:bg-[rgb(var(--bg))] rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[rgb(var(--text))]" />
          </button>
          
          {/* Date Range Display */}
          <div className="text-center">
            {getSelectedRangeText() && (
              <div className="text-sm text-[rgb(var(--brand))] font-medium">
                {getSelectedRangeText()}
              </div>
            )}
            <div className="text-xs text-[rgb(var(--muted))]">
              {isSelecting ? 'Drag to select range' : 'Click to select, drag for range'}
            </div>
          </div>
          
          <button
            onClick={viewMode === 'month' ? goToNextMonth : goToNextWeek}
            className="p-2 hover:bg-[rgb(var(--bg))] rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-[rgb(var(--text))]" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-[rgb(var(--muted))] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {viewMode === 'month' 
            ? calendarDays.map((date, index) => renderCalendarDay(date, index))
            : weekDays.map((date, index) => renderCalendarDay(date, index))
          }
        </div>
      </div>

    </div>
  );
}
