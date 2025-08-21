"use client";

import { useState, useEffect } from 'react';
import { BookmarkIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

export interface SavedSearch {
  id: string;
  name: string;
  filters: {
    range: string;
    onlyFree: boolean;
    startDate: string | null;
    endDate: string | null;
    eventTypes: string[];
    ageRestriction: string;
    searchLocation: { lat: number; lng: number; formatted: string } | null;
  };
  created_at: string;
}

interface SavedSearchesProps {
  onLoadSearch: (filters: SavedSearch['filters']) => void;
  currentFilters: SavedSearch['filters'];
}

export default function SavedSearches({ onLoadSearch, currentFilters }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const saveCurrentSearch = async () => {
    if (!searchName.trim()) return;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: searchName.trim(),
          filters: currentFilters,
        });

      if (error) throw error;

      setSearchName('');
      setIsModalOpen(false);
      await loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSavedSearches();
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const loadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[rgb(var(--brand))] text-white rounded-md hover:opacity-90 transition-all shadow-sm hover:shadow-md text-xs"
      >
        <BookmarkIcon className="w-3.5 h-3.5" />
        <span className="font-medium">Saved</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-600">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
                <BookmarkIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
                Saved Searches
              </h3>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Save Current Search */}
              <div className="p-3 bg-[rgb(var(--bg))] rounded-lg">
                <h4 className="text-sm font-medium text-[rgb(var(--text))] mb-2">Save Current Search</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[rgb(var(--panel))] text-[rgb(var(--text))] rounded-lg border border-gray-600"
                  />
                  <button
                    onClick={saveCurrentSearch}
                    disabled={isLoading || !searchName.trim()}
                    className="px-4 py-2 bg-[rgb(var(--brand))] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Saved Searches List */}
              {savedSearches.length === 0 ? (
                <div className="text-center py-8 text-[rgb(var(--muted))]">
                  <BookmarkIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No saved searches yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-[rgb(var(--text))]">{search.name}</h5>
                        <button
                          onClick={() => deleteSavedSearch(search.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-[rgb(var(--muted))] mb-2">
                        {search.filters.range} • {search.filters.onlyFree ? 'Free only' : 'All prices'} • {search.filters.ageRestriction}
                      </div>
                      <button
                        onClick={() => loadSearch(search)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[rgb(var(--brand))] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        Load Search
                      </button>
                    </div>
                  ))}
                </div>
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
