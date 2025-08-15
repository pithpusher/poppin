"use client";

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLocationSearch } from '@/components/context/LocationSearchContext';

interface LocationSearchBarProps {
  onLocationSelect?: (lat: number, lng: number, formatted: string) => void;
  placeholder?: string;
  className?: string;
}

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted: string;
  suggestions: Array<{ label: string; center: [number, number] }>;
}

export default function LocationSearchBar({ 
  onLocationSelect, 
  placeholder = "Search for a location...",
  className = ""
}: LocationSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ label: string; center: [number, number] }>>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { handleLocationSearch } = useLocationSearch();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: query })
      });

      if (!response.ok) {
        throw new Error('Location search failed');
      }

      const result: GeocodeResult = await response.json();
      setSuggestions(result.suggestions);
      setShowSuggestions(true);

      // Always use the first result when searching
      if (result.lat && result.lng) {
        // Use context handler for navigation
        handleLocationSearch(result.lat, result.lng, result.formatted);
        
        // Also call prop handler if provided (for backward compatibility)
        if (onLocationSelect) {
          onLocationSelect(result.lat, result.lng, result.formatted);
        }
        
        // Update the input with the formatted result
        setQuery(result.formatted);
        setShowSuggestions(false);
      }
    } catch (err) {
      setError('Location search failed. Please try again.');
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: { label: string; center: [number, number] }) => {
    const [lng, lat] = suggestion.center;
    setQuery(suggestion.label);
    setShowSuggestions(false);
    
    // Automatically search when suggestion is clicked
    handleLocationSearch(lat, lng, suggestion.label);
    
    // Also call prop handler if provided (for backward compatibility)
    if (onLocationSelect) {
      onLocationSelect(lat, lng, suggestion.label);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center h-10 rounded-full token-border bg-[rgb(var(--panel))] px-3">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-[rgb(var(--muted))] text-[rgb(var(--text))] pr-2"
        />
        <button
          onClick={searchLocation}
          disabled={isSearching || !query.trim()}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[rgb(var(--bg))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MagnifyingGlassIcon className="w-4 h-4 text-[rgb(var(--text))]" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--panel))] token-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-[rgb(var(--bg))] transition-colors text-sm"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
