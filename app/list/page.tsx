// ==============================
// FILE: app/list/page.tsx
// (matches /map layout and design, but as list view)
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
import FilterBar, { Range } from "@/components/map/FilterBar";
import SavedSearches from "@/components/map/SavedSearches";
import RecentSearches, { RecentSearch } from "@/components/map/RecentSearches";
import PopularEvents from "@/components/map/PopularEvents";
import PersonalizedRecommendations from "@/components/map/PersonalizedRecommendations";
import { useLocation } from "@/components/map/useLocation";
import { BellIcon } from "@heroicons/react/24/outline";
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

export default function ListPage() {
    const [events, setEvents] = useState<Ev[]>([]);
    const [range, setRange] = useState<Range>("all");
    const [onlyFree, setOnlyFree] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; formatted: string } | null>(null);
    const [eventTypes, setEventTypes] = useState<string[]>([]);
    const [ageRestriction, setAgeRestriction] = useState<string>("All Ages");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
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
        range?: Range;
        onlyFree?: boolean;
        startDate?: string | null;
        endDate?: string | null;
        eventTypes?: string[];
        ageRestriction?: string;
        priceRange?: [number, number];
    }) => {
        const url = new URL(window.location.href);
        
        // Update URL parameters
        if (newFilters.range !== undefined) {
            url.searchParams.set('range', newFilters.range);
            localStorage.setItem('poppin_filters_range', newFilters.range);
        }
        if (newFilters.onlyFree !== undefined) {
            url.searchParams.set('onlyFree', newFilters.onlyFree.toString());
            localStorage.setItem('poppin_filters_onlyFree', newFilters.onlyFree.toString());
        }
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
        if (newFilters.eventTypes !== undefined) {
            if (newFilters.eventTypes.length > 0) {
                url.searchParams.set('eventTypes', newFilters.eventTypes.join(','));
                localStorage.setItem('poppin_filters_eventTypes', JSON.stringify(newFilters.eventTypes));
            } else {
                url.searchParams.delete('eventTypes');
                localStorage.removeItem('poppin_filters_eventTypes');
            }
        }
        if (newFilters.ageRestriction !== undefined) {
            url.searchParams.set('ageRestriction', newFilters.ageRestriction);
            localStorage.setItem('poppin_filters_ageRestriction', newFilters.ageRestriction);
        }
        if (newFilters.priceRange !== undefined) {
            url.searchParams.set('priceRange', JSON.stringify(newFilters.priceRange));
            localStorage.setItem('poppin_filters_priceRange', JSON.stringify(newFilters.priceRange));
        }
        
        // Update URL without page reload
        window.history.replaceState({}, '', url.toString());
    }, []);

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
            
            if (result.lat && result.lng) {
                const searchResult = {
                    lat: result.lat,
                    lng: result.lng,
                    formatted: result.formatted
                };
                
                setSearchLocation(searchResult);
                
                // Clear search term and suggestions
                setSearchTerm("");
                setShowSearchSuggestions(false);
                setSearchSuggestions([]);
                
                // Clear any previous search errors
                setSearchError(null);
                
                // Show success message
                success('Location found!', `Showing events near ${result.formatted.split(',').slice(0, 2).join(', ')}`);
                
                // Save to recent searches
                await saveRecentSearch(searchTerm, searchResult);
            } else {
                throw new Error('No location found for this search');
            }
        } catch (error) {
            console.error('Search error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Search failed. Please try again.';
            setSearchError(errorMessage);
            showError('Search failed', errorMessage);
        } finally {
            setIsSearching(false);
        }
    };

    // Save search to recent searches
    const saveRecentSearch = async (searchTerm: string, location: { lat: number; lng: number; formatted: string } | null) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if search already exists
            const { data: existing } = await supabase
                .from('recent_searches')
                .select('id')
                .eq('user_id', user.id)
                .eq('search_term', searchTerm)
                .single();

            if (existing) {
                // Update timestamp
                await supabase
                    .from('recent_searches')
                    .update({ created_at: new Date().toISOString() })
                    .eq('id', existing.id);
            } else {
                // Insert new search
                await supabase
                    .from('recent_searches')
                    .insert({
                        user_id: user.id,
                        search_term: searchTerm,
                        location,
                    });
            }
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    // Debounced search suggestions
    const debouncedSearchSuggestions = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSearchSuggestions([]);
            setShowSearchSuggestions(false);
            setIsSearchSuggestionsLoading(false);
            return;
        }

        try {
            setIsSearchSuggestionsLoading(true);
            const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: query })
            });

            if (!response.ok) {
                throw new Error('Location search failed');
            }

            const result = await response.json();
            setSearchSuggestions(result.suggestions || []);
            setShowSearchSuggestions(true);
        } catch (error) {
            console.error('Search suggestions error:', error);
            setSearchSuggestions([]);
            setShowSearchSuggestions(false);
            warning('Search suggestions unavailable', 'Unable to load location suggestions. Please try again.');
        } finally {
            setIsSearchSuggestionsLoading(false);
        }
    }, [warning]);

    // Handle search input changes with debouncing
    const handleSearchInputChange = (value: string) => {
        setSearchTerm(value);
        
        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout for debounced search
        debounceTimeoutRef.current = setTimeout(() => {
            debouncedSearchSuggestions(value);
        }, 300); // 300ms delay
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: { label: string; center: [number, number] }) => {
        const [lng, lat] = suggestion.center;
        setSearchTerm(suggestion.label);
        setShowSearchSuggestions(false);
        setSearchSuggestions([]);
        
        // Set search location
        const searchResult = {
            lat,
            lng,
            formatted: suggestion.label
        };
        
        setSearchLocation(searchResult);
    };

    // Handle URL search parameters and filter persistence
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const lat = urlParams.get('lat');
        const lng = urlParams.get('lng');
        const query = urlParams.get('query');
        
        // Load search location from URL
        if (lat && lng && query) {
            setSearchLocation({
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                formatted: query
            });
        }
        
        // Load filters from URL or localStorage
        const savedRange = urlParams.get('range') || localStorage.getItem('poppin_filters_range') || 'all';
        const savedOnlyFree = urlParams.get('onlyFree') === 'true' || localStorage.getItem('poppin_filters_onlyFree') === 'true';
        const savedStartDate = urlParams.get('startDate') || localStorage.getItem('poppin_filters_startDate') || null;
        const savedEndDate = urlParams.get('endDate') || localStorage.getItem('poppin_filters_endDate') || null;
        const savedEventTypes = urlParams.get('eventTypes') ? urlParams.get('eventTypes')!.split(',') : JSON.parse(localStorage.getItem('poppin_filters_eventTypes') || '[]');
        const savedAgeRestriction = urlParams.get('ageRestriction') || localStorage.getItem('poppin_filters_ageRestriction') || 'All Ages';
        const savedPriceRange = urlParams.get('priceRange') ? JSON.parse(urlParams.get('priceRange')!) : JSON.parse(localStorage.getItem('poppin_filters_priceRange') || '[0,100]');
        
        setRange(savedRange as Range);
        setOnlyFree(savedOnlyFree);
        setStartDate(savedStartDate);
        setEndDate(savedEndDate);
        setEventTypes(savedEventTypes);
        setAgeRestriction(savedAgeRestriction);
        setPriceRange(savedPriceRange);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Close search suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.search-container')) {
                setShowSearchSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Deduplicate rows (prevents dupes from re-mounts)
    const uniqueEvents = useMemo(
        () => Array.from(new Map(events.map((e) => [e.id, e])).values()),
        [events]);

    // Fetch with filters
    useEffect(() => {
        const load = async () => {
            try {
                setIsEventsLoading(true);
                
                let q = supabase.from("events").select("id,title,start_at,venue_name,lat,lng,image_url,status,price_cents,is_free,event_type,age_restriction,description").eq("status", "pending_review").filter("lat", "not.is", null).filter("lng", "not.is", null).order("start_at", {
                    ascending: true
                }).limit(500);
                
                const now = new Date();
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(now);
                endOfDay.setHours(23, 59, 59, 999);
                const in7 = new Date(now);
                in7.setDate(now.getDate() + 7);
                const in30 = new Date(now);
                in30.setDate(now.getDate() + 30);
                
                // Date constraints
                if (range !== "all") {
                    q = q.gte("start_at", startOfDay.toISOString());
                    if (range === "today") q = q.lte("start_at", endOfDay.toISOString());
                    if (range === "week") q = q.lte("start_at", in7.toISOString());
                    if (range === "month") q = q.lte("start_at", in30.toISOString());
                }
                
                if (startDate && endDate) {
                    const startIso = new Date(startDate + "T00:00:00").toISOString();
                    const endIso = new Date(endDate + "T23:59:59").toISOString();
                    q = q.gte("start_at", startIso).lte("start_at", endIso);
                }
                
                // Pricing filter
                if (onlyFree) {
                    q = q.eq("is_free", true);
                } else if (priceRange[0] > 0 || priceRange[1] < 100) {
                    // Apply price range filter
                    if (priceRange[0] > 0) {
                        q = q.gte("price_cents", priceRange[0] * 100); // Convert dollars to cents
                    }
                    if (priceRange[1] < 100) {
                        q = q.lte("price_cents", priceRange[1] * 100); // Convert dollars to cents
                    }
                }
                
                // Event type filter
                if (eventTypes.length > 0) {
                    q = q.in("event_type", eventTypes);
                }
                
                // Age restriction filter
                if (ageRestriction !== "All Ages") {
                    q = q.eq("age_restriction", ageRestriction);
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
    }, [range, onlyFree, startDate, endDate, eventTypes, ageRestriction, priceRange]);

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
                            {/* Left Column - Event List Title */}
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[rgb(var(--text))]">Event List</h1>
                                <p className={`text-base sm:text-lg md:text-xl ${tokens.muted}`}>Browse events in a detailed list format</p>
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
                                            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                                                    <div className="w-4 h-4 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="ml-2 text-sm text-[rgb(var(--muted))]">Loading suggestions...</span>
                                                </div>
                                            ) : searchSuggestions.length > 0 ? (
                                                searchSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full text-left px-3 py-2 hover:bg-[rgb(var(--bg))] transition-colors text-sm rounded-md"
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
                                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                                                className="w-full text-left px-3 py-2 hover:bg-[rgb(var(--bg))] transition-colors text-sm rounded-md"
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

                {/* Filter Bar - Sticky */}
                <div className="sticky top-0 z-40 bg-[rgb(var(--bg))]">
                                    <FilterBar
                    range={range}
                    setRange={(newRange) => {
                        setRange(newRange);
                        updateFilterURL({ range: newRange });
                    }}
                    onlyFree={onlyFree}
                    setOnlyFree={(newOnlyFree) => {
                        setOnlyFree(newOnlyFree);
                        updateFilterURL({ onlyFree: newOnlyFree });
                    }}
                    startDate={startDate}
                    setStartDate={(newStartDate) => {
                        setStartDate(newStartDate);
                        updateFilterURL({ startDate: newStartDate });
                    }}
                    endDate={endDate}
                    setEndDate={(newEndDate) => {
                        setEndDate(newEndDate);
                        updateFilterURL({ endDate: newEndDate });
                    }}
                    onApplyCustom={() => {}}
                    eventTypes={eventTypes}
                    setEventTypes={(newEventTypes) => {
                        setEventTypes(newEventTypes);
                        updateFilterURL({ eventTypes: newEventTypes });
                    }}
                    ageRestriction={ageRestriction}
                    setAgeRestriction={(newAgeRestriction) => {
                        setAgeRestriction(newAgeRestriction);
                        updateFilterURL({ ageRestriction: newAgeRestriction });
                    }}
                    priceRange={priceRange}
                    setPriceRange={(newPriceRange) => {
                        setPriceRange(newPriceRange);
                        updateFilterURL({ priceRange: newPriceRange });
                    }}
                />
                </div>

                {/* Search & Discovery Tools - Non-sticky */}
                <div className="px-4 py-2 bg-[rgb(var(--bg))] border-t border-[rgb(var(--border-color))]/20 border-b border-[rgb(var(--border-color))]/20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center gap-1.5 overflow-x-auto">
                            <PopularEvents
                                onEventClick={(eventId) => {
                                    setSelectedId(eventId);
                                    // Scroll to event in list
                                    const eventElement = document.getElementById(`event-${eventId}`);
                                    if (eventElement) {
                                        eventElement.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                currentLocation={location}
                            />
                            
                            <PersonalizedRecommendations
                                onEventClick={(eventId) => {
                                    setSelectedId(eventId);
                                    // Scroll to event in list
                                    const eventElement = document.getElementById(`event-${eventId}`);
                                    if (eventElement) {
                                        eventElement.scrollIntoView({ behavior: 'smooth' });
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
                                onLoadSearch={(filters) => {
                                    setRange(filters.range as Range);
                                    setOnlyFree(filters.onlyFree);
                                    setStartDate(filters.startDate);
                                    setEndDate(filters.endDate);
                                    setEventTypes(filters.eventTypes);
                                    setAgeRestriction(filters.ageRestriction);
                                    if (filters.searchLocation) {
                                        setSearchLocation(filters.searchLocation);
                                    }
                                    
                                    // Update URL and localStorage with loaded filters
                                    updateFilterURL({
                                        range: filters.range as Range,
                                        onlyFree: filters.onlyFree,
                                        startDate: filters.startDate,
                                        endDate: filters.endDate,
                                        eventTypes: filters.eventTypes,
                                        ageRestriction: filters.ageRestriction
                                    });
                                }}
                                currentFilters={{
                                    range,
                                    onlyFree,
                                    startDate,
                                    endDate,
                                    eventTypes,
                                    ageRestriction,
                                    searchLocation
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content - Events List */}
                <div className="grid md:grid-cols-[2fr,1fr] gap-6 max-w-7xl mx-auto px-4 py-6">
                    {/* Left Column - Main Content Area */}
                    <div className="space-y-6">
                        {/* Search Location Display */}
                        {searchLocation && (
                            <div className="text-center">
                                <div className="inline-block bg-[rgb(var(--panel))] token-border rounded-xl px-6 py-3">
                                    <div className="text-sm text-[rgb(var(--muted))] mb-1">
                                        Showing events near:
                                    </div>
                                    <div className="text-lg font-semibold text-[rgb(var(--text))]">
                                        {searchLocation.formatted.split(',').slice(0, 2).join(', ')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Events Loading State */}
                        {isEventsLoading && (
                            <div className="space-y-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="animate-in fade-in-0 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="rounded-lg token-border p-4 bg-[rgb(var(--panel))] space-y-3">
                                            <div className="h-4 bg-[rgb(var(--muted))]/20 rounded w-3/4 animate-pulse" />
                                            <div className="h-3 bg-[rgb(var(--muted))]/20 rounded w-1/2 animate-pulse" />
                                            <div className="h-3 bg-[rgb(var(--muted))]/20 rounded w-2/3 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Events Error State */}
                        {!isEventsLoading && events.length === 0 && searchLocation && (
                            <div className="text-center p-12">
                                <ExclamationTriangleIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                                <div className="text-xl font-semibold text-[rgb(var(--text))] mb-2">No events found</div>
                                <div className="text-base text-[rgb(var(--muted))] mb-6">
                                    No events match your current filters in this area.
                                </div>
                                <RetryButton 
                                    onRetry={() => {
                                        // Refetch events logic here
                                    }} 
                                    size="md"
                                    variant="outline"
                                >
                                    Refresh Events
                                </RetryButton>
                            </div>
                        )}

                        {/* Events List - Main Content */}
                        {!isEventsLoading && (
                            <div className="space-y-4">
                                {uniqueEvents.map((ev) => (
                                    <div
                                        key={ev.id}
                                        id={`event-${ev.id}`}
                                        className={`rounded-lg token-border p-4 bg-[rgb(var(--panel))] hover:border-[color:var(--border-color)] transition-all duration-200 ${
                                            selectedId === ev.id ? "ring-2 ring-[rgb(var(--brand))] ring-opacity-50" : ""
                                        }`}
                                        onClick={() => setSelectedId(ev.id)}
                                    >
                                        {/* Event Image */}
                                        {ev.image_url && (
                                            <div className="mb-3 rounded-lg overflow-hidden">
                                                <img
                                                    src={ev.image_url}
                                                    alt={ev.title}
                                                    className="w-full h-32 object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Event Title */}
                                        <h4 className="font-semibold text-[rgb(var(--text))] mb-2 text-lg">
                                            {ev.title}
                                        </h4>

                                        {/* Event Details */}
                                        <div className="space-y-2 text-sm text-[rgb(var(--muted))] mb-3">
                                            <div>{fmt(ev.start_at)}</div>
                                            {ev.venue_name && <div>{ev.venue_name}</div>}
                                            {ev.event_type && <div className="text-xs">{ev.event_type}</div>}
                                        </div>

                                        {/* Price Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                                                    ev.is_free
                                                        ? "bg-green-50 border-green-200 text-green-700"
                                                        : "bg-amber-50 border-amber-200 text-amber-700"
                                                }`}
                                            >
                                                {ev.is_free ? "Free" : "Paid"}
                                            </span>
                                            
                                            {ev.age_restriction && ev.age_restriction !== "All Ages" && (
                                                <span className="text-xs text-[rgb(var(--muted))]">
                                                    Age: {ev.age_restriction}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/e/${ev.id}`}
                                                className="flex-1 text-center px-3 py-2 bg-[rgb(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                                            >
                                                Details
                                            </Link>
                                            
                                            {ev.lat && ev.lng && (
                                                <Link
                                                    href={`/map?lat=${ev.lat}&lng=${ev.lng}&query=${encodeURIComponent(ev.title)}`}
                                                    className="flex-1 text-center px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[rgb(var(--border-color))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--panel))] transition-colors"
                                                >
                                                    Map
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {uniqueEvents.length === 0 && !searchLocation && (
                                    <div className="text-center p-12">
                                        <div className="text-lg font-semibold text-[rgb(var(--text))] mb-2">No events found</div>
                                        <div className="text-base text-[rgb(var(--muted))] mb-6">
                                            Try adjusting your filters or search for a different location.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar (Events Near You) */}
                    <aside className="space-y-3 pb-6 md:block">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">Events Near You</h3>
                            <div className="text-sm text-[rgb(var(--muted))]">
                                {isEventsLoading ? 'Loading events...' : `${uniqueEvents.length} upcoming at this location`}
                            </div>
                        </div>

                        {/* Events Loading State */}
                        {isEventsLoading && (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-in fade-in-0 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="rounded-lg token-border p-3 bg-[rgb(var(--panel))] space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="h-4 bg-[rgb(var(--muted))]/20 rounded w-3/4 animate-pulse" />
                                                <div className="h-3 bg-[rgb(var(--muted))]/20 rounded w-12 animate-pulse" />
                                            </div>
                                            <div className="h-3 bg-[rgb(var(--muted))]/20 rounded w-1/2 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Events Error State */}
                        {!isEventsLoading && events.length === 0 && searchLocation && (
                            <div className="text-center p-6">
                                <ExclamationTriangleIcon className="w-12 h-12 text-[rgb(var(--muted))] mx-auto mb-3" />
                                <div className="text-[rgb(var(--text))] font-medium mb-2">No events found</div>
                                <div className="text-sm text-[rgb(var(--muted))] mb-4">
                                    No events match your current filters in this area.
                                </div>
                                <RetryButton 
                                    onRetry={() => {
                                        // Refetch events logic here
                                    }} 
                                    size="sm"
                                    variant="outline"
                                >
                                    Refresh Events
                                </RetryButton>
                            </div>
                        )}

                        {/* Events List - Sidebar */}
                        {!isEventsLoading && (
                            <div className="grid gap-3 max-h-[40vh] md:max-h-none overflow-y-auto">
                                {uniqueEvents.map((ev) => (
                                    <button
                                        key={ev.id}
                                        onClick={() => {
                                            setSelectedId(ev.id);
                                            // Scroll to event in main content
                                            const eventElement = document.getElementById(`event-${ev.id}`);
                                            if (eventElement) {
                                                eventElement.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        className={`text-left rounded-lg token-border p-3 bg-[rgb(var(--panel))] hover:border-[color:var(--border-color)] ${selectedId===ev.id ? "outline outline-1 outline-blue-500" : ""}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium text-sm">{ev.title}</div>
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                                    ev.is_free
                                                        ? "bg-green-50 border-green-200 text-green-700"
                                                        : "bg-amber-50 border-amber-200 text-amber-700"
                                                }`}
                                            >
                                                {ev.is_free ? "Free" : "Paid"}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[rgb(var(--muted))]">
                                            {fmt(ev.start_at)}
                                            {ev.venue_name ? " · " + ev.venue_name : ""}
                                            {ev.event_type ? ` · ${ev.event_type}` : ""}
                                        </div>
                                    </button>
                                ))}

                                {uniqueEvents.length === 0 && (
                                    <div className="rounded-lg token-border p-3 bg-[rgb(var(--panel))] text-sm text-[rgb(var(--text))]">
                                        No events match these filters.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected Event Details */}
                        {selected && (
                            <div className="rounded-lg token-border p-3 bg-[rgb(var(--panel))]">
                                <div className="text-sm font-semibold">{selected.title}</div>
                                <div className="text-xs text-zinc-600 mt-1">
                                    {fmt(selected.start_at)}
                                    {selected.venue_name ? " · " + selected.venue_name : ""}
                                    {selected.event_type ? ` · ${selected.event_type}` : ""}
                                </div>
                                {selected.age_restriction && selected.age_restriction !== "All Ages" && (
                                    <div className="text-xs text-zinc-500 mt-1">
                                        Age: {selected.age_restriction}
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </div>

                {/* Bottom spacing for mobile navigation */}
                <div className="pb-16 sm:pb-0"></div>
            </div>
        </ErrorBoundary>
    );
}

function fmt(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}
