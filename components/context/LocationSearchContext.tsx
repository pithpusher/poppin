"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface LocationSearchContextType {
  handleLocationSearch: (lat: number, lng: number, formatted: string) => void;
}

const LocationSearchContext = createContext<LocationSearchContextType | undefined>(undefined);

export function LocationSearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLocationSearch = (lat: number, lng: number, formatted: string) => {
    const searchParams = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      query: formatted
    });

    if (pathname === '/map') {
      // If we're already on the map page, update the URL without navigation
      const url = new URL(window.location.href);
      url.searchParams.set('lat', lat.toString());
      url.searchParams.set('lng', lng.toString());
      url.searchParams.set('query', formatted);
      window.history.pushState({}, '', url.toString());
      
      // Trigger a page refresh to update the map
      window.location.reload();
    } else {
      // Navigate to map page with search parameters
      router.push(`/map?${searchParams.toString()}`);
    }
  };

  return (
    <LocationSearchContext.Provider value={{ handleLocationSearch }}>
      {children}
    </LocationSearchContext.Provider>
  );
}

export function useLocationSearch() {
  const context = useContext(LocationSearchContext);
  if (context === undefined) {
    throw new Error('useLocationSearch must be used within a LocationSearchProvider');
  }
  return context;
}
