// ==============================
// FILE: app/calendar/page.tsx
// (matches /map layout and design, but as calendar view)
// ==============================
"use client";
import {
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef
} from "react";
import {
    supabase
} from "@/lib/supabaseClient";
import SavedSearches from "@/components/map/SavedSearches";
import RecentSearches, { RecentSearch } from "@/components/map/RecentSearches";
import PopularEvents from "@/components/map/PopularEvents";
import PersonalizedRecommendations from "@/components/map/PersonalizedRecommendations";
import EventCalendar from "@/components/map/EventCalendar";
import { useLocation } from "@/components/map/useLocation";
import { CalendarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { tokens } from "@/components/tokens";
import { useToast } from '@/lib/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { RetryButton } from '@/components/ui/RetryButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

type Ev = {
    id: string;
    title: string;
    start_at: string;
    venue_name: string | null;
    lat: number | null;
    lng: number | null;
    image_url: string | null;
    status: "approved" | "pending" | "rejected" | string;
    is_free?: boolean | null;
    price_cents?: number | null;
    event_type?: string | null;
    age_restriction?: string | null;
    description?: string | null;
};

export default function CalendarPage() {
    const [events, setEvents] = useState<Ev[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; formatted: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState<Array<{ label: string; center: [number, number] }>>([]);
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchSuggestionsLoading, setIsSearchSuggestionsLoading] = useState(false);
    const [isEventsLoading, setIsEventsLoading] = useState(true);
    const [searchError, setSearchError] = useState<string | null>(null);
    const { location, isLoading, error } = useLocation();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { success, error: showError, warning, info } = useToast();

    // Update URL and localStorage when filters change
    const updateFilterURL = useCallback((newFilters: {
        startDate?: string | null;
        endDate?: string | null;
    }) => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        const url = new URL(window.location.href);
        
        // Update URL parameters
        if (newFilters.startDate !== undefined) {
            if (newFilters.startDate) {
                url.searchParams.set('startDate', newFilters.startDate);
                localStorage.setItem('poppin_filters_startDate', newFilters.startDate);
            } else {
                url.searchParams.delete('startDate');
                localStorage.removeItem('poppin_filters_startDate');
            }
        }
        if (newFilters.endDate !== undefined) {
            if (newFilters.endDate) {
                url.searchParams.set('endDate', newFilters.endDate);
                localStorage.setItem('poppin_filters_endDate', newFilters.endDate);
            } else {
                url.searchParams.delete('endDate');
                localStorage.removeItem('poppin_filters_endDate');
            }
        }
        
        // Update URL without page reload
        window.history.replaceState({}, '', url.toString());
    }, []);

    // Handle date range selection from calendar
    const handleDateRangeSelect = useCallback((start: Date, end: Date) => {
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        
        setStartDate(startStr);
        setEndDate(endStr);
        setSelectedDateRange({ start, end });
        updateFilterURL({ startDate: startStr, endDate: endStr });
    }, [updateFilterURL]);

    // Handle single date selection from calendar
    const handleDateSelect = useCallback((date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        setStartDate(dateStr);
        setEndDate(dateStr);
        setSelectedDateRange({ start: date, end: date });
        updateFilterURL({ startDate: dateStr, endDate: dateStr });
    }, [updateFilterURL]);

    // Clear date range
    const clearDateRange = useCallback(() => {
        setStartDate(null);
        setEndDate(null);
        setSelectedDateRange({ start: null, end: null });
        updateFilterURL({ startDate: null, endDate: null });
    }, [updateFilterURL]);

    // Handle view mode change from calendar
    const handleViewModeChange = useCallback((viewMode: 'month' | 'week') => {
        const today = new Date();
        let newEndDate: Date;
        
        if (viewMode === 'week') {
            // Week view: today to end of week (Saturday)
            newEndDate = new Date(today);
            newEndDate.setDate(today.getDate() + (6 - today.getDay()));
        } else {
            // Month view: today to end of month
            newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(newEndDate.toISOString().split('T')[0]);
        setSelectedDateRange({ 
            start: today, 
            end: newEndDate 
        });
        
        updateFilterURL({ 
            startDate: today.toISOString().split('T')[0], 
            endDate: newEndDate.toISOString().split('T')[0] 
        });
    }, [updateFilterURL]);

    // Handle search functionality
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        setSearchError(null);
        
        try {
            // Use the geocoding API to get real location data
            const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: searchTerm })
            });

            if (!response.ok) {
                throw new Error('Location search failed');
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                const { lat, lng, formatted } = result.data;
                setSearchLocation({ lat, lng, formatted });
                success(`Searching events near ${formatted}`);
            } else {
                setSearchError('Location not found. Please try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input changes with debouncing
    const handleSearchInputChange = useCallback((value: string) => {
        setSearchTerm(value);
        
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        // Set new timeout for search suggestions
        if (value.trim()) {
            debounceTimeoutRef.current = setTimeout(() => {
                // TODO: Implement search suggestions API call
                setIsSearchSuggestionsLoading(false);
            }, 300);
        } else {
            setSearchSuggestions([]);
            setShowSearchSuggestions(false);
        }
    }, []);

    // Handle suggestion click
    const handleSuggestionClick = useCallback((suggestion: { label: string; center: [number, number] }) => {
        setSearchTerm(suggestion.label);
        setSearchLocation({
            lat: suggestion.center[1],
            lng: suggestion.center[0],
            formatted: suggestion.label
        });
        setShowSearchSuggestions(false);
        success(`Searching events near ${suggestion.label}`);
    }, [success]);

    // Load user location when page loads
    useEffect(() => {
        if (location && !searchLocation && !isLoading) {
            // Automatically use user's current location when page loads
            setSearchLocation({
                lat: location.lat,
                lng: location.lng,
                formatted: 'Your current location'
            });
        }
    }, [location, searchLocation, isLoading]);

    // Set default date range on page load
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday
        
        // Set default date range based on current view (default to month view)
        const defaultEndDate = endOfMonth;
        
        if (!startDate && !endDate) {
            setStartDate(today.toISOString().split('T')[0]);
            setEndDate(defaultEndDate.toISOString().split('T')[0]);
            setSelectedDateRange({ 
                start: today, 
                end: defaultEndDate 
            });
            
            // Update URL and localStorage with default range
            updateFilterURL({ 
                startDate: today.toISOString().split('T')[0], 
                endDate: defaultEndDate.toISOString().split('T')[0] 
            });
        }
    }, []); // Only run once on page load

    // Load events based on current filters
    useEffect(() => {
        const load = async () => {
            setIsEventsLoading(true);
            try {
                let q = supabase
                    .from("events")
                    .select("*")
                    .eq("status", "approved")
                    .order("start_at", { ascending: true });

                // Date filters
                if (startDate) {
                    q = q.gte("start_at", startDate);
                }
                if (endDate) {
                    q = q.lte("start_at", endDate);
                }

                // Location filter
                if (searchLocation) {
                    // Simple radius search (can be improved with PostGIS)
                    const radius = 50; // 50km radius
                    q = q.gte("lat", searchLocation.lat - radius / 111.32)
                         .lte("lat", searchLocation.lat + radius / 111.32)
                         .gte("lng", searchLocation.lng - radius / (111.32 * Math.cos(searchLocation.lat * Math.PI / 180)))
                         .lte("lng", searchLocation.lng + radius / (111.32 * Math.cos(searchLocation.lat * Math.PI / 180)));
                } else if (location && !searchLocation) {
                    // Use user's current location if no search location
                    const radius = 25; // 25km radius for current location
                    q = q.gte("lat", location.lat - radius / 111.32)
                         .lte("lat", location.lat + radius / 111.32)
                         .gte("lng", location.lng - radius / (111.32 * Math.cos(location.lat * Math.PI / 180)))
                         .lte("lng", location.lng + radius / (111.32 * Math.cos(location.lat * Math.PI / 180)));
                }

                const {
                    data,
                    error,
                    status
                } = await q;
                if (error) {
                    console.error("Supabase error", {
                        status,
                        message: error.message,
                        details: error.details
                    });
                    setEvents([]);
                    return;
                }
                const rows: Ev[] = (data ?? []).map((r: any) => ({
                    id: r.id,
                    title: r.title,
                    start_at: r.start_at,
                    status: r.status,
                    venue_name: r.venue_name,
                    lat: r.lat != null ? Number(r.lat) : null,
                    lng: r.lng != null ? Number(r.lng) : null,
                    image_url: r.image_url,
                    is_free: r.is_free,
                    price_cents: r.price_cents,
                    event_type: r.event_type,
                    age_restriction: r.age_restriction,
                    description: r.description,
                })) || [];
                setEvents(rows);
            } catch (e) {
                console.error("Fetch crash", e);
                setEvents([]);
            } finally {
                setIsEventsLoading(false);
            }
        };
        load();
    }, [startDate, endDate, searchLocation, location]);

    const uniqueEvents = useMemo(
        () => Array.from(new Map(events.map((e) => [e.id, e])).values()),
        [events]);

    const selected = useMemo(
        () => uniqueEvents.find((e) => e.id === selectedId) || null,
        [uniqueEvents, selectedId]);

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-[rgb(var(--bg))]">
                {/* Toast Notifications */}
                <ToastContainer toasts={[]} onDismiss={() => {}} />
                
                {/* Offline Indicator */}
                <OfflineIndicator />
                
                {/* Header with Post Event Button - Non-sticky */}
                <div className="relative z-30 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
                    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 lg:py-8">
                        <div className="flex items-center justify-between gap-4 md:gap-6">
                            {/* Left Column - Event Calendar Title */}
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[rgb(var(--text))]">
                                    Event Calendar
                                </h1>
                                <p className={`text-base sm:text-lg md:text-xl ${tokens.muted}`}>
                                    Browse events in a calendar format
                                </p>
                            </div>
                            
                            {/* Middle Column - Search Bar (Hidden on Mobile) */}
                            <div className="hidden md:flex flex-1 px-4 md:px-6">
                                <div className="relative w-full search-container overflow-visible">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
                                    <input
                                        type="text"
                                        placeholder="Search events, venues, or locations..."
                                        className="w-full pl-10 pr-4 py-3 md:py-4 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-lg token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] text-sm md:text-base"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchInputChange(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 md:px-4 md:py-2 bg-[rgb(var(--brand))] text-white rounded-md text-xs md:text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                                    >
                                        {isSearching ? (
                                            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            "Search"
                                        )}
                                    </button>
                                </div>
                                
                                {/* Search Error Display */}
                                {searchError && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm text-red-800 font-medium">Search Error</div>
                                                <div className="text-sm text-red-700 mt-1">{searchError}</div>
                                                <RetryButton 
                                                    onRetry={handleSearch} 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="mt-2"
                                                >
                                                    Try Again
                                                </RetryButton>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Search Suggestions Dropdown - Positioned outside container */}
                                {(showSearchSuggestions || isSearchSuggestionsLoading) && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0.5 w-full max-w-md bg-[rgb(var(--panel))] token-border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                                        <div className="p-1">
                                            {isSearchSuggestionsLoading ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-sm text-[rgb(var(--muted))]">Loading suggestions...</span>
                                                </div>
                                            ) : searchSuggestions.length > 0 ? (
                                                searchSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full text-left px-3 py-2 hover:bg-[rgb(var(--brand))] transition-colors text-sm rounded-md"
                                                    >
                                                        {suggestion.label}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-[rgb(var(--muted))]">
                                                    No suggestions found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Right Column - CTA Buttons */}
                            <div className="flex gap-1.5 md:gap-3 flex-shrink-0 ml-auto">
                                <Link
                                    href="/map"
                                    className="inline-flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:bg-[rgb(var(--bg))] transition-colors"
                                >
                                    Map View
                                </Link>
                                
                                <Link
                                    href="/post"
                                    className="inline-flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-2 bg-[rgb(var(--brand))] text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                                >
                                    Post Event
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Section - Non-sticky */}
                <div className="md:hidden px-4 py-4 relative bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
                    <div className="max-w-md mx-auto">
                        <div className="relative search-container overflow-visible">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
                            <input
                                type="text"
                                placeholder="Search events, venues, or locations..."
                                className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-lg token-border focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] text-sm"
                                value={searchTerm}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-[rgb(var(--brand))] text-white rounded-md text-xs font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                            >
                                {isSearching ? (
                                    <div className="w-3 h-3 md:w-4 md:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Search"
                                )}
                            </button>
                        </div>
                        
                        {/* Search Error Display - Mobile */}
                        {searchError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm text-red-800 font-medium">Search Error</div>
                                        <div className="text-sm text-red-700 mt-1">{searchError}</div>
                                        <RetryButton 
                                            onRetry={handleSearch} 
                                            size="sm" 
                                            variant="outline"
                                            className="mt-2"
                                        >
                                            Try Again
                                        </RetryButton>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Search Suggestions Dropdown - Mobile */}
                        {(showSearchSuggestions || isSearchSuggestionsLoading) && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0 w-full max-w-md bg-[rgb(var(--panel))] token-border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                                <div className="p-1">
                                    {isSearchSuggestionsLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="w-4 h-4 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-2 text-sm text-[rgb(var(--muted))]">Loading suggestions...</span>
                                        </div>
                                    ) : searchSuggestions.length > 0 ? (
                                        searchSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full text-left px-3 py-2 hover:bg-[rgb(var(--brand))] transition-colors text-sm rounded-md"
                                            >
                                                {suggestion.label}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-[rgb(var(--muted))]">
                                            No suggestions found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search & Discovery Tools - Non-sticky */}
                <div className="px-4 py-2 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center gap-1.5 overflow-x-auto">
                            <PopularEvents
                                onEventClick={(eventId) => {
                                    setSelectedId(eventId);
                                    // Scroll to event in calendar
                                    if (typeof document !== 'undefined') {
                                        const eventElement = document.getElementById(`event-${eventId}`);
                                        if (eventElement) {
                                            eventElement.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                }}
                                currentLocation={location}
                            />
                            
                            <PersonalizedRecommendations
                                onEventClick={(eventId) => {
                                    setSelectedId(eventId);
                                    // Scroll to event in calendar
                                    if (typeof document !== 'undefined') {
                                        const eventElement = document.getElementById(`event-${eventId}`);
                                        if (eventElement) {
                                            eventElement.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                }}
                                currentLocation={location}
                            />
                            
                            <RecentSearches
                                onLoadSearch={(searchTerm, location) => {
                                    setSearchTerm(searchTerm);
                                    if (location) {
                                        setSearchLocation(location);
                                    }
                                }}
                            />
                            
                            <SavedSearches
                                currentFilters={{
                                    range: "all",
                                    onlyFree: false,
                                    startDate,
                                    endDate,
                                    eventTypes: [],
                                    ageRestriction: "All Ages",
                                    searchLocation
                                }}
                                onLoadSearch={(filters) => {
                                    setStartDate(filters.startDate);
                                    setEndDate(filters.endDate);
                                    if (filters.searchLocation) {
                                        setSearchLocation(filters.searchLocation);
                                    }
                                    
                                    // Update URL and localStorage with loaded filters
                                    updateFilterURL({
                                        startDate: filters.startDate,
                                        endDate: filters.endDate,
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content - Event Calendar */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Column - Calendar */}
                        <div className="lg:col-span-3">
                            <EventCalendar
                                events={uniqueEvents}
                                selectedDate={selectedDateRange.start}
                                selectedDateRange={selectedDateRange}
                                onDateSelect={handleDateSelect}
                                onDateRangeSelect={handleDateRangeSelect}
                                onEventClick={setSelectedId}
                                onViewModeChange={handleViewModeChange}
                            />
                        </div>

                        {/* Right Column - Sidebar */}
                        <aside className="space-y-3 pb-6 md:block">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">
                                    {selectedDateRange.start 
                                        ? selectedDateRange.end && selectedDateRange.start.toDateString() !== selectedDateRange.end.toDateString()
                                            ? `Events from ${selectedDateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${selectedDateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                            : `Events on ${selectedDateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                        : 'Events Near You'
                                    }
                                </h3>
                                <div className="text-sm text-[rgb(var(--muted))]">
                                    {isEventsLoading ? 'Loading events...' : 
                                        `${uniqueEvents.length} event${uniqueEvents.length !== 1 ? 's' : ''} found`
                                    }
                                </div>
                            </div>

                            {/* Selected Event Details */}
                            {selected && (
                                <div className="bg-[rgb(var(--panel))] token-border rounded-lg p-4">
                                    <h4 className="font-medium text-[rgb(var(--text))] mb-3">Selected Event</h4>
                                    {selected.image_url && (
                                        <div className="mb-3 rounded-lg overflow-hidden">
                                            <img
                                                src={selected.image_url}
                                                alt={selected.title}
                                                className="w-full h-24 object-cover"
                                            />
                                        </div>
                                    )}
                                    <h5 className="font-semibold text-[rgb(var(--text))] mb-2 text-sm">
                                        {selected.title}
                                    </h5>
                                    <div className="space-y-1 text-xs text-[rgb(var(--muted))] mb-3">
                                        <div>{new Date(selected.start_at).toLocaleDateString()}</div>
                                        {selected.venue_name && <div>{selected.venue_name}</div>}
                                        {selected.event_type && <div>{selected.event_type}</div>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/e/${selected.id}`}
                                            className="flex-1 text-center px-3 py-2 bg-[rgb(var(--brand))] text-white rounded-lg text-xs font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                                        >
                                            Details
                                        </Link>
                                        {selected.lat && selected.lng && (
                                            <Link
                                                href={`/map?lat=${selected.lat}&lng=${selected.lng}&query=${encodeURIComponent(selected.title)}`}
                                                className="flex-1 text-center px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))] rounded-lg text-xs font-medium hover:bg-[rgb(var(--panel))] transition-colors"
                                            >
                                                Map
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>

                {/* Bottom spacing for mobile navigation */}
                <div className="pb-20 md:pb-6"></div>
            </div>
        </ErrorBoundary>
    );
}
