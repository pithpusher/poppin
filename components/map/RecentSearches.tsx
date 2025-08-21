"use client";

import { useState, useEffect } from 'react';
import { ClockIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

export interface RecentSearch {
  id: string;
  search_term: string;
  location: { lat: number; lng: number; formatted: string } | null;
  created_at: string;
}

interface RecentSearchesProps {
  onLoadSearch: (searchTerm: string, location: { lat: number; lng: number; formatted: string } | null) => void;
}

export default function RecentSearches({ onLoadSearch }: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      loadRecentSearches();
    }
  }, [isModalOpen]);

  const loadRecentSearches = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recent_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentSearches(data || []);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearch = async (searchTerm: string, location: { lat: number; lng: number; formatted: string } | null) => {
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

  const deleteRecentSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recent_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadRecentSearches();
    } catch (error) {
      console.error('Error deleting recent search:', error);
    }
  };

  const clearAllSearches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('recent_searches')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const handleSearchClick = (search: RecentSearch) => {
    onLoadSearch(search.search_term, search.location);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md hover:from-red-500 hover:to-red-400 transition-all shadow-sm hover:shadow-md text-xs"
      >
        <ClockIcon className="w-3.5 h-3.5" />
        <span className="font-medium">Recent</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-600 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                Recent Searches
              </h3>
              {recentSearches.length > 0 && (
                <button
                  onClick={clearAllSearches}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-[rgb(var(--muted))]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--brand))] mx-auto"></div>
                  <p className="mt-2">Loading...</p>
                </div>
              ) : recentSearches.length === 0 ? (
                <div className="text-center py-8 text-[rgb(var(--muted))]">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent searches yet</p>
                </div>
              ) : (
                recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => handleSearchClick(search)}
                        className="flex-1 text-left hover:text-[rgb(var(--brand))] transition-colors"
                      >
                        <div className="font-medium text-[rgb(var(--text))]">{search.search_term}</div>
                        {search.location && (
                          <div className="text-xs text-[rgb(var(--muted))]">{search.location.formatted}</div>
                        )}
                      </button>
                      <button
                        onClick={() => deleteRecentSearch(search.id)}
                        className="text-red-400 hover:text-red-300 transition-colors ml-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      {new Date(search.created_at).toLocaleDateString()} • {new Date(search.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-600">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export the saveSearch function so it can be used elsewhere
export { RecentSearch };
