"use client";

import { useState, useEffect } from 'react';
import { SparklesIcon, HeartIcon, EyeIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

export interface RecommendedEvent {
  id: string;
  title: string;
  start_at: string;
  venue_name: string | null;
  image_url: string | null;
  event_type: string | null;
  is_free: boolean | null;
  price_cents: number | null;
  similarity_score: number;
  reason: string;
}

interface PersonalizedRecommendationsProps {
  onEventClick: (eventId: string) => void;
  currentLocation?: { lat: number; lng: number } | null;
}

export default function PersonalizedRecommendations({ onEventClick, currentLocation }: PersonalizedRecommendationsProps) {
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{
    favoriteEventTypes: string[];
    preferredPriceRange: 'free' | 'low' | 'medium' | 'high' | 'all';
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night' | 'all';
  } | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      loadUserPreferences();
      loadRecommendations();
    }
  }, [isModalOpen]);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's favorite event types from their interaction history
      const { data: interactions } = await supabase
        .from('user_event_interactions')
        .select('event_id, interaction_type, events(event_type)')
        .eq('user_id', user.id)
        .in('interaction_type', ['view', 'like', 'bookmark']);

      if (interactions) {
        const eventTypeCounts: { [key: string]: number } = {};
        interactions.forEach(interaction => {
          const eventType = interaction.events?.event_type;
          if (eventType) {
            eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
          }
        });

        const favoriteEventTypes = Object.entries(eventTypeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([type]) => type);

        // Get user's price preferences
        const { data: priceInteractions } = await supabase
          .from('user_event_interactions')
          .select('events(is_free, price_cents)')
          .eq('user_id', user.id)
          .in('interaction_type', ['like', 'bookmark']);

        let preferredPriceRange: 'free' | 'low' | 'medium' | 'high' | 'all' = 'all';
        if (priceInteractions && priceInteractions.length > 0) {
          const freeCount = priceInteractions.filter(i => i.events?.is_free).length;
          const paidCount = priceInteractions.filter(i => !i.events?.is_free).length;
          
          if (freeCount > paidCount * 2) preferredPriceRange = 'free';
          else if (paidCount > 0) {
            const avgPrice = priceInteractions
              .filter(i => i.events?.price_cents)
              .reduce((sum, i) => sum + (i.events?.price_cents || 0), 0) / 
              priceInteractions.filter(i => i.events?.price_cents).length;
            
            if (avgPrice < 1000) preferredPriceRange = 'low';
            else if (avgPrice < 2500) preferredPriceRange = 'medium';
            else preferredPriceRange = 'high';
          }
        }

        setUserPreferences({
          favoriteEventTypes,
          preferredPriceRange,
          preferredTime: 'all' // Could be enhanced with time-based analysis
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      
      if (!userPreferences) {
        // Fallback to general recommendations if no user preferences
        await loadGeneralRecommendations();
        return;
      }

      let query = supabase
        .from('events')
        .select('id, title, start_at, venue_name, image_url, event_type, is_free, price_cents')
        .eq('status', 'approved')
        .not('start_at', 'lt', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(15);

      // Filter by favorite event types
      if (userPreferences.favoriteEventTypes.length > 0) {
        query = query.in('event_type', userPreferences.favoriteEventTypes);
      }

      // Filter by price preference
      if (userPreferences.preferredPriceRange === 'free') {
        query = query.eq('is_free', true);
      } else if (userPreferences.preferredPriceRange === 'low') {
        query = query.lte('price_cents', 1000);
      } else if (userPreferences.preferredPriceRange === 'medium') {
        query = query.gte('price_cents', 1000).lte('price_cents', 2500);
      } else if (userPreferences.preferredPriceRange === 'high') {
        query = query.gte('price_cents', 2500);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Add similarity scores and reasons
      const eventsWithScores = (data || []).map(event => {
        let similarityScore = 0;
        let reason = '';

        // Event type match
        if (event.event_type && userPreferences.favoriteEventTypes.includes(event.event_type)) {
          similarityScore += 3;
          reason = `Based on your interest in ${event.event_type}`;
        }

        // Price match
        if (userPreferences.preferredPriceRange === 'free' && event.is_free) {
          similarityScore += 2;
          reason = 'Matches your preference for free events';
        } else if (userPreferences.preferredPriceRange !== 'free' && !event.is_free) {
          similarityScore += 1;
          reason = 'Matches your price preferences';
        }

        // Recency bonus
        const daysUntilEvent = Math.ceil((new Date(event.start_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilEvent <= 7) similarityScore += 1;

        return {
          ...event,
          similarity_score: similarityScore,
          reason: reason || 'Recommended based on your preferences'
        };
      });

      // Sort by similarity score and then by date
      eventsWithScores.sort((a, b) => {
        if (b.similarity_score !== a.similarity_score) {
          return b.similarity_score - a.similarity_score;
        }
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      });

      setRecommendedEvents(eventsWithScores.slice(0, 10));
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // Fallback to general recommendations
      await loadGeneralRecommendations();
    } finally {
      setIsLoading(false);
    }
  };

  const loadGeneralRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_at, venue_name, image_url, event_type, is_free, price_cents')
        .eq('status', 'approved')
        .not('start_at', 'lt', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(10);

      if (error) throw error;

      const eventsWithScores = (data || []).map(event => ({
        ...event,
        similarity_score: 1,
        reason: 'Popular events happening soon'
      }));

      setRecommendedEvents(eventsWithScores);
    } catch (error) {
      console.error('Error loading general recommendations:', error);
      setRecommendedEvents([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const formatPrice = (isFree: boolean | null, priceCents: number | null) => {
    if (isFree) return 'Free';
    if (priceCents) return `$${(priceCents / 100).toFixed(2)}`;
    return 'Price TBD';
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[rgb(var(--brand))] text-white rounded-md hover:opacity-90 transition-all shadow-sm hover:shadow-md text-xs"
      >
        <SparklesIcon className="w-3.5 h-3.5" />
        <span className="font-medium">For You</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-3">
                                 <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
                   <SparklesIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                   Personalized Recommendations
                 </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {userPreferences && (
                <div className="text-sm text-[rgb(var(--muted))]">
                  <p>Based on your preferences for {userPreferences.favoriteEventTypes.slice(0, 3).join(', ')} events</p>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-[rgb(var(--muted))]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
                  <p className="mt-2">Finding events for you...</p>
                </div>
              ) : recommendedEvents.length === 0 ? (
                <div className="text-center py-8 text-[rgb(var(--muted))]">
                  <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recommendations available yet</p>
                  <p className="text-xs mt-1">Try interacting with some events to get personalized suggestions</p>
                </div>
              ) : (
                recommendedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => onEventClick(event.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Recommendation Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          event.similarity_score >= 4 ? 'bg-purple-500 text-white' :
                          event.similarity_score >= 2 ? 'bg-blue-500 text-white' :
                          'bg-[rgb(var(--muted))] text-[rgb(var(--text))]'
                        }`}>
                          <HeartIcon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Event Image */}
                      <div className="flex-shrink-0">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[rgb(var(--muted))] rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-[rgb(var(--text))] opacity-50" />
                          </div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[rgb(var(--text))] mb-1 line-clamp-2">
                          {event.title}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted))] mb-2">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(event.start_at)}
                          </span>
                          {event.venue_name && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              {event.venue_name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs">
                            {event.event_type && (
                              <span className="px-2 py-1 bg-[rgb(var(--muted))] text-[rgb(var(--text))] rounded-full">
                                {event.event_type}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-green-600 text-white rounded-full font-medium">
                              {formatPrice(event.is_free, event.price_cents)}
                            </span>
                          </div>
                          
                          <div className="text-xs text-[rgb(var(--muted))] max-w-32 text-right">
                            {event.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
