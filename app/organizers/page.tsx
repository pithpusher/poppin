'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { tokens } from '@/components/tokens';
import { useToast } from '@/lib/useToast';
import { ToastContainer } from '@/components/ui/Toast';

import { RetryButton } from '@/components/ui/RetryButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

type Organizer = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  event_count: number;
  follower_count: number;
  verified: boolean;
  created_at: string;
};

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; formatted: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{ label: string; center: [number, number] }[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearchSuggestionsLoading, setIsSearchSuggestionsLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const { success, warning } = useToast();

  useEffect(() => {
    loadOrganizers();
  }, []);

  useEffect(() => {
    filterOrganizers();
  }, [organizers, searchTerm, searchLocation]);

  async function loadOrganizers() {
    try {
      setLoading(true);
      
      // Get organizers with event counts
      const { data, error } = await supabase
        .from('organizers')
        .select(`
          id, name, description, image_url, location, verified, created_at,
          events!inner(id)
        `)
        .eq('events.status', 'approved')
        .order('name', { ascending: true });

      if (error) throw error;

      // Process the data to get event counts and format for display
      const organizersWithCounts = (data || []).map(org => ({
        id: org.id,
        name: org.name,
        description: org.description,
        image_url: org.image_url,
        location: org.location,
        event_count: Array.isArray(org.events) ? org.events.length : 0,
        follower_count: 0, // Placeholder for future feature
        verified: org.verified,
        created_at: org.created_at
      }));

      setOrganizers(organizersWithCounts);
    } catch (error) {
      console.error('Error loading organizers:', error);
      warning('Failed to load organizers', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function filterOrganizers() {
    let filtered = [...organizers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(organizer => 
        organizer.name.toLowerCase().includes(term) ||
        organizer.description?.toLowerCase().includes(term) ||
        organizer.location?.toLowerCase().includes(term)
      );
    }

    // Location filter (if implemented in the future)
    if (searchLocation) {
      // For now, just show all organizers when location is set
      // In the future, you could filter by distance from location
    }

    setFilteredOrganizers(filtered);
  }

  // Handle search input changes with debouncing
  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      // For now, just filter locally
      // In the future, you could add API search here
    }, 300); // 300ms delay
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // For now, just filter locally
      // In the future, you could add API search here
      success('Search completed', `Found ${filteredOrganizers.length} organizers`);
    }
  };

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[rgb(var(--bg))]">
          {/* Toast Notifications */}
          <ToastContainer toasts={[]} onDismiss={() => {}} />
          

          
          <div className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
                <p className="mt-4 text-[rgb(var(--muted))]">Loading organizers...</p>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        {/* Toast Notifications */}
        <ToastContainer toasts={[]} onDismiss={() => {}} />
        

        
        {/* Header with Post Event Button - Non-sticky */}
        <div className="relative z-30 bg-[rgb(var(--bg))] border-b border-[rgb(var(--border-color))]/20">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 lg:py-8">
            <div className="flex items-center justify-between gap-4 md:gap-6">
              {/* Left Column - Organizers List Title */}
              <div className="flex-shrink-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[rgb(var(--text))]">Organizers</h1>
                <p className={`text-base sm:text-lg md:text-xl ${tokens.muted}`}>Discover event organizers in your area</p>
              </div>
              
              {/* Middle Column - Search Bar (Hidden on Mobile) */}
              <div className="hidden md:flex flex-1 px-4 md:px-6">
                <div className="relative w-full search-container overflow-visible">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted))]" />
                  <input
                    type="text"
                    placeholder="Search organizers, descriptions, or locations..."
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
              </div>
              
                                            {/* Right Column - CTA Buttons */}
               <div className="flex gap-2 md:gap-3 flex-shrink-0 ml-auto">
                 <Link
                   href="/map"
                   className="inline-flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-xl text-xs md:text-sm font-medium hover:bg-[rgb(var(--bg))] transition-colors"
                 >
                   Event Map
                 </Link>
                 
                 <Link
                   href="/post"
                   className="inline-flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-xs md:text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
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
                placeholder="Search organizers, descriptions, or locations..."
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
          </div>
        </div>

                 {/* Main Content Area */}
         <div className="flex-1 flex flex-col lg:flex-row min-h-0">
           {/* Left Column - Organizers List */}
           <div className="flex-1 lg:min-w-0">


             {/* Organizers Grid */}
             <div className="p-4">
               {filteredOrganizers.length === 0 ? (
                 <div className="text-center py-12">
                   <UserGroupIcon className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                   <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">No organizers found</h3>
                   <p className={`text-base ${tokens.muted} mb-6 max-w-2xl mx-auto`}>
                     {searchTerm ? 'Try adjusting your search terms to find more organizers.' : 'No organizers are available at the moment.'}
                   </p>
                   <div className="flex flex-col sm:flex-row gap-3 justify-center">
                     {searchTerm && (
                       <button
                         onClick={() => setSearchTerm('')}
                         className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                       >
                         Clear Search
                       </button>
                     )}
                     <Link
                       href="/post"
                       className="px-4 py-2 border border-[rgb(var(--border-color))] text-[rgb(var(--text))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--panel))] transition-colors"
                     >
                       Post an Event
                     </Link>
                   </div>
                 </div>
               ) : (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                   {filteredOrganizers.map((organizer) => (
                     <div
                       key={organizer.id}
                       className="group block bg-[rgb(var(--panel))] token-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                       onClick={() => window.location.href = `/o/${encodeURIComponent(organizer.slug || organizer.name)}`}
                     >
                       {/* Organizer Image */}
                       <div className="aspect-video bg-[rgb(var(--bg))] overflow-hidden">
                         {organizer.image_url ? (
                           <img
                             src={organizer.image_url}
                             alt={organizer.name}
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted))]">
                             <UserGroupIcon className="w-12 h-12" />
                           </div>
                         )}
                       </div>

                       {/* Organizer Content */}
                       <div className="p-4">
                         {/* Verified Badge */}
                         {organizer.verified && (
                           <div className="inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded-full mb-2">
                             ✓ Verified
                           </div>
                         )}

                         {/* Organizer Name */}
                         <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2 group-hover:text-[rgb(var(--brand))] transition-colors">
                           {organizer.name}
                         </h3>

                         {/* Organizer Details */}
                         <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                           {organizer.description && (
                             <p className="line-clamp-2">{organizer.description}</p>
                           )}
                           
                           {organizer.location && (
                             <div className="flex items-center gap-2">
                               <MapPinIcon className="w-4 h-4" />
                               <span>{organizer.location}</span>
                             </div>
                           )}

                           <div className="flex items-center gap-4 text-sm">
                             <span className="flex items-center gap-1">
                               <CalendarIcon className="w-4 h-4" />
                               {organizer.event_count} event{organizer.event_count !== 1 ? 's' : ''}
                             </span>
                             
                             <span className="flex items-center gap-1">
                               <UserGroupIcon className="w-4 h-4" />
                               {organizer.follower_count} follower{organizer.follower_count !== 1 ? 's' : ''}
                             </span>
                           </div>

                           <div className="text-xs text-[rgb(var(--muted))]">
                             Since {formatDate(organizer.created_at)}
                           </div>
                         </div>

                         {/* Action Buttons */}
                         <div className="flex gap-2 mt-3 pt-3 border-t border-[rgb(var(--border-color))]/20">
                           <Link
                             href={`/o/${encodeURIComponent(organizer.slug || organizer.name)}`}
                             className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors text-sm font-medium"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <UserGroupIcon className="w-4 h-4" />
                             View Profile
                           </Link>
                           
                           <Link
                             href={`/list?organizer=${encodeURIComponent(organizer.name)}`}
                             className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--panel))] transition-colors text-sm font-medium"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <CalendarIcon className="w-4 h-4" />
                             Events
                           </Link>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>

                       {/* Right Column - Sidebar (Similar to /list page) */}
            <div className="lg:w-80 lg:border-l lg:border-[rgb(var(--border-color))]/20 bg-[rgb(var(--bg))]">
              <div className="p-4 space-y-6 pb-16 sm:pb-6">
                {/* Post Event CTA */}
                <div className="bg-[rgb(var(--panel))] token-border rounded-xl p-4 text-center">
                  <UserGroupIcon className="w-12 h-12 text-[rgb(var(--brand))] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-2">Want to be featured here?</h3>
                  <p className={`text-sm ${tokens.muted} mb-4`}>
                    Post events and build your organizer profile to get discovered by thousands nearby.
                  </p>
                  <Link
                    href="/post"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-xl text-sm font-medium hover:bg-[rgb(var(--brand))]/90 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Post an Event
                  </Link>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[rgb(var(--text))]">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link
                      href="/list"
                      className="flex items-center gap-3 p-3 bg-[rgb(var(--panel))] rounded-lg hover:bg-[rgb(var(--panel))]/80 transition-colors"
                    >
                      <CalendarIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                      <span className="text-sm text-[rgb(var(--text))]">Browse Events</span>
                    </Link>
                    <Link
                      href="/map"
                      className="flex items-center gap-3 p-3 bg-[rgb(var(--panel))] rounded-lg hover:bg-[rgb(var(--panel))]/80 transition-colors"
                    >
                      <MapPinIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                      <span className="text-sm text-[rgb(var(--text))]">Map View</span>
                    </Link>
                    <Link
                      href="/post"
                      className="flex items-center gap-3 p-3 bg-[rgb(var(--panel))] rounded-lg hover:bg-[rgb(var(--panel))]/80 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
                      <span className="text-sm text-[rgb(var(--text))]">Post Event</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
         </div>
      </div>
    </ErrorBoundary>
  );
}
