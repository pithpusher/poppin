'use client';

import React, { useState, useEffect } from 'react';
import { MapPinIcon, ClockIcon, TruckIcon, UserIcon, BuildingOfficeIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface RoutePlannerProps {
  destination: {
    lat: number;
    lng: number;
    title: string;
    venue_name?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

interface Route {
  distance: string;
  duration: string;
  mode: 'driving' | 'walking' | 'transit';
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
}

export default function RoutePlanner({ 
  destination, 
  isOpen, 
  onClose, 
  userLocation 
}: RoutePlannerProps) {
  const [selectedMode, setSelectedMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock route data - in real app, this would come from Google Maps Directions API
  const mockRoutes: Route[] = [
    {
      mode: 'driving',
      distance: '2.3 mi',
      duration: '8 min',
      steps: [
        { instruction: 'Head north on Main St', distance: '0.2 mi', duration: '1 min' },
        { instruction: 'Turn right onto Oak Ave', distance: '1.8 mi', duration: '6 min' },
        { instruction: 'Turn left onto Event Blvd', distance: '0.3 mi', duration: '1 min' }
      ]
    },
    {
      mode: 'walking',
      distance: '2.3 mi',
      duration: '45 min',
      steps: [
        { instruction: 'Head north on Main St', distance: '0.2 mi', duration: '4 min' },
        { instruction: 'Turn right onto Oak Ave', distance: '1.8 mi', duration: '36 min' },
        { instruction: 'Turn left onto Event Blvd', distance: '0.3 mi', duration: '5 min' }
      ]
    },
    {
      mode: 'transit',
      distance: '2.3 mi',
      duration: '12 min',
      steps: [
        { instruction: 'Walk to Main St & Oak Ave bus stop', distance: '0.1 mi', duration: '2 min' },
        { instruction: 'Take bus 15 towards Downtown', distance: '1.8 mi', duration: '8 min' },
        { instruction: 'Walk to destination', distance: '0.4 mi', duration: '2 min' }
      ]
    }
  ];

  useEffect(() => {
    if (isOpen && destination) {
      // Simulate API call delay
      setIsLoading(true);
      setTimeout(() => {
        setRoutes(mockRoutes);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, destination]);

  const handleGetDirections = () => {
    if (destination) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
      if (userLocation) {
        const fullUrl = `${url}&origin=${userLocation.lat},${userLocation.lng}`;
        window.open(fullUrl, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }
  };

  const handleStartNavigation = () => {
    if (destination) {
      // In a real app, this would integrate with navigation apps
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=${selectedMode}`;
      window.open(url, '_blank');
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return <TruckIcon className="w-5 h-5" />;
      case 'walking': return <UserIcon className="w-5 h-5" />;
      case 'transit': return <BuildingOfficeIcon className="w-5 h-5" />;
      default: return <MapPinIcon className="w-5 h-5" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'driving': return 'text-blue-600';
      case 'walking': return 'text-green-600';
      case 'transit': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen || !destination) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[rgb(var(--panel))] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[rgb(var(--border-color))]/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[rgb(var(--text))] mb-2">Route to Event</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text))]">
                  <MapPinIcon className="w-4 h-4 text-[rgb(var(--brand))]" />
                  <span className="font-medium">{destination.title}</span>
                </div>
                {destination.venue_name && (
                  <div className="text-sm text-[rgb(var(--muted))] ml-6">
                    {destination.venue_name}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg))]/80 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Transportation Mode Selector */}
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">Transportation Mode</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['driving', 'walking', 'transit'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`
                    p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${selectedMode === mode
                      ? 'border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/10'
                      : 'border-[rgb(var(--border-color))]/20 hover:border-[rgb(var(--border-color))]/40'
                    }
                  `}
                >
                  <div className={getModeColor(mode)}>
                    {getModeIcon(mode)}
                  </div>
                  <span className="text-sm font-medium text-[rgb(var(--text))] capitalize">
                    {mode}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Route Information */}
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">Route Details</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <ArrowPathIcon className="w-8 h-8 text-[rgb(var(--brand))] animate-spin mx-auto mb-2" />
                <p className="text-[rgb(var(--muted))]">Calculating route...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes
                  .filter(route => route.mode === selectedMode)
                  .map((route, index) => (
                    <div key={index} className="bg-[rgb(var(--bg))] rounded-lg p-4">
                      {/* Route Summary */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={getModeColor(route.mode)}>
                            {getModeIcon(route.mode)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[rgb(var(--text))] capitalize">
                              {route.mode}
                            </div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              {route.distance} • {route.duration}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleStartNavigation}
                          className="px-4 py-2 bg-[rgb(var(--brand))] text-white text-sm font-medium rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors"
                        >
                          Start Navigation
                        </button>
                      </div>

                      {/* Route Steps */}
                      <div className="space-y-3">
                        {route.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--brand))]/20 text-[rgb(var(--brand))] text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                              {stepIndex + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-[rgb(var(--text))]">
                                {step.instruction}
                              </div>
                              <div className="text-xs text-[rgb(var(--muted))] mt-1">
                                {step.distance} • {step.duration}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Alternative Routes */}
          {!isLoading && routes.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-3">Alternative Routes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {routes
                  .filter(route => route.mode !== selectedMode)
                  .map((route, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMode(route.mode)}
                      className="p-3 bg-[rgb(var(--bg))] rounded-lg border border-[rgb(var(--border-color))]/20 hover:border-[rgb(var(--border-color))]/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={getModeColor(route.mode)}>
                          {getModeIcon(route.mode)}
                        </div>
                        <span className="text-sm font-medium text-[rgb(var(--text))] capitalize">
                          {route.mode}
                        </span>
                      </div>
                      <div className="text-xs text-[rgb(var(--muted))]">
                        {route.distance} • {route.duration}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[rgb(var(--border-color))]/20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGetDirections}
              className="flex-1 px-4 py-3 bg-[rgb(var(--brand))] text-white font-medium rounded-lg hover:bg-[rgb(var(--brand))]/90 transition-colors flex items-center justify-center gap-2"
            >
              <MapPinIcon className="w-5 h-5" />
              Open in Google Maps
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-3 bg-[rgb(var(--bg))] text-[rgb(var(--text))] font-medium rounded-lg border border-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--bg))]/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
