'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPinIcon, ArrowUpIcon, GlobeAltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinIconSolid, ArrowUpIcon as ArrowUpIconSolid } from '@heroicons/react/24/solid';

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface Geofence {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  events: string[];
}

interface AdvancedLocationServiceProps {
  onLocationUpdate?: (location: LocationData) => void;
  onGeofenceEnter?: (geofence: Geofence) => void;
  onGeofenceExit?: (geofence: Geofence) => void;
  enableTracking?: boolean;
  enableGeofencing?: boolean;
  updateInterval?: number;
  className?: string;
}

export default function AdvancedLocationService({
  onLocationUpdate,
  onGeofenceEnter,
  onGeofenceExit,
  enableTracking = false,
  enableGeofencing = false,
  updateInterval = 10000,
  className = ""
}: AdvancedLocationServiceProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(enableTracking);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [activeGeofences, setActiveGeofences] = useState<Set<string>>(new Set());
  
  const locationWatcher = useRef<number | null>(null);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const geofenceCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Enhanced haptic feedback for location events
  const triggerHaptic = useCallback((type: 'location' | 'geofence' | 'error' = 'location') => {
    if (!('vibrate' in navigator)) return;
    
    switch (type) {
      case 'location':
        navigator.vibrate([20, 30, 20]);
        break;
      case 'geofence':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'error':
        navigator.vibrate([100, 200, 100]);
        break;
    }
  }, []);

  // Check location permission status
  const checkLocationPermission = useCallback(async () => {
    if (!('permissions' in navigator)) {
      setLocationPermission('granted');
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(permission.state);
      
      permission.onchange = () => {
        setLocationPermission(permission.state);
      };
    } catch (error) {
      console.warn('Permission API not supported:', error);
      setLocationPermission('granted');
    }
  }, []);

  // Get current location with high accuracy
  const getCurrentLocation = useCallback(async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(location);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        options
      );
    });
  }, []);

  // Reverse geocoding to get address
  const getAddressFromCoords = useCallback(async (lat: number, lng: number): Promise<Partial<LocationData>> => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&language=en`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0].components;
        return {
          address: data.results[0].formatted,
          city: result.city || result.town || result.village,
          state: result.state,
          country: result.country
        };
      }
    } catch (error) {
      console.warn('Geocoding failed:', error);
    }
    
    return {};
  }, []);

  // Start location tracking
  const startLocationTracking = useCallback(async () => {
    if (!navigator.geolocation || locationPermission !== 'granted') {
      setLocationError('Location permission not granted');
      return;
    }

    try {
      setIsLoading(true);
      setLocationError(null);

      // Get initial location
      const location = await getCurrentLocation();
      const address = await getAddressFromCoords(location.lat, location.lng);
      const fullLocation = { ...location, ...address };
      
      setCurrentLocation(fullLocation);
      onLocationUpdate?.(fullLocation);
      triggerHaptic('location');

      // Start watching for location changes
      locationWatcher.current = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Only update if location changed significantly (more than 10 meters)
          if (currentLocation) {
            const distance = calculateDistance(
              currentLocation.lat, currentLocation.lng,
              newLocation.lat, newLocation.lng
            );
            
            if (distance < 10) return;
          }

          const address = await getAddressFromCoords(newLocation.lat, newLocation.lng);
          const fullLocation = { ...newLocation, ...address };
          
          setCurrentLocation(fullLocation);
          onLocationUpdate?.(fullLocation);
          triggerHaptic('location');
        },
        (error) => {
          setLocationError(`Tracking error: ${error.message}`);
          triggerHaptic('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

      // Set up periodic location updates
      trackingInterval.current = setInterval(async () => {
        try {
          const location = await getCurrentLocation();
          const address = await getAddressFromCoords(location.lat, location.lng);
          const fullLocation = { ...location, ...address };
          
          setCurrentLocation(fullLocation);
          onLocationUpdate?.(fullLocation);
        } catch (error) {
          console.warn('Periodic location update failed:', error);
        }
      }, updateInterval);

      setIsTracking(true);
    } catch (error) {
      setLocationError(`Failed to start tracking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  }, [locationPermission, onLocationUpdate, updateInterval, getCurrentLocation, getAddressFromCoords, triggerHaptic, currentLocation]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (locationWatcher.current) {
      navigator.geolocation.clearWatch(locationWatcher.current);
      locationWatcher.current = null;
    }

    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }

    setIsTracking(false);
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  }, []);

  // Check geofence status
  const checkGeofences = useCallback(() => {
    if (!currentLocation || !enableGeofencing) return;

    geofences.forEach(geofence => {
      const distance = calculateDistance(
        currentLocation.lat, currentLocation.lng,
        geofence.center[0], geofence.center[1]
      );

      const isInside = distance <= geofence.radius;
      const wasInside = activeGeofences.has(geofence.id);

      if (isInside && !wasInside) {
        // Entered geofence
        setActiveGeofences(prev => new Set([...prev, geofence.id]));
        onGeofenceEnter?.(geofence);
        triggerHaptic('geofence');
      } else if (!isInside && wasInside) {
        // Exited geofence
        setActiveGeofences(prev => {
          const newSet = new Set(prev);
          newSet.delete(geofence.id);
          return newSet;
        });
        onGeofenceExit?.(geofence);
        triggerHaptic('geofence');
      }
    });
  }, [currentLocation, enableGeofencing, geofences, activeGeofences, calculateDistance, onGeofenceEnter, onGeofenceExit, triggerHaptic]);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setLocationError(null);

      const location = await getCurrentLocation();
      const address = await getAddressFromCoords(location.lat, location.lng);
      const fullLocation = { ...location, ...address };
      
      setCurrentLocation(fullLocation);
      setLocationPermission('granted');
      onLocationUpdate?.(fullLocation);
      triggerHaptic('location');
    } catch (error) {
      setLocationPermission('denied');
      setLocationError(`Permission denied: ${error instanceof Error ? error.message : 'Unknown error'}`);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation, getAddressFromCoords, onLocationUpdate, triggerHaptic]);

  // Initialize component
  useEffect(() => {
    checkLocationPermission();
    
    return () => {
      stopLocationTracking();
    };
  }, [checkLocationPermission, stopLocationTracking]);

  // Handle tracking state changes
  useEffect(() => {
    if (isTracking && locationPermission === 'granted') {
      startLocationTracking();
    } else if (!isTracking) {
      stopLocationTracking();
    }
  }, [isTracking, locationPermission, startLocationTracking, stopLocationTracking]);

  // Set up geofence checking
  useEffect(() => {
    if (enableGeofencing && currentLocation) {
      checkGeofences();
      
      geofenceCheckInterval.current = setInterval(checkGeofences, 5000);
      
      return () => {
        if (geofenceCheckInterval.current) {
          clearInterval(geofenceCheckInterval.current);
        }
      };
    }
  }, [enableGeofencing, currentLocation, checkGeofences]);

  // Sample geofences for demo
  useEffect(() => {
    if (enableGeofencing) {
      setGeofences([
        {
          id: 'central-park',
          name: 'Central Park',
          center: [40.7829, -73.9654],
          radius: 1000,
          events: ['event1', 'event2']
        },
        {
          id: 'times-square',
          name: 'Times Square',
          center: [40.7580, -73.9855],
          radius: 500,
          events: ['event3', 'event4']
        }
      ]);
    }
  }, [enableGeofencing]);

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 10) return 'Excellent';
    if (accuracy < 50) return 'Good';
    if (accuracy < 100) return 'Fair';
    return 'Poor';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
          Location Services
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Permission Status */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${locationPermission === 'granted' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : locationPermission === 'denied'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }
          `}>
            {locationPermission === 'granted' ? 'Granted' : 
             locationPermission === 'denied' ? 'Denied' : 'Prompt'}
          </div>
          
          {/* Tracking Toggle */}
          <button
            onClick={() => setIsTracking(!isTracking)}
            disabled={locationPermission !== 'granted' || isLoading}
            className={`
              p-2 rounded-full transition-colors
              ${isTracking
                ? 'bg-[rgb(var(--brand))] text-white'
                : 'bg-[rgb(var(--bg))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg))]/80'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={isTracking ? 'Stop tracking' : 'Start tracking'}
          >
            {isTracking ? (
              <ArrowUpIconSolid className="w-4 h-4" />
            ) : (
              <ArrowUpIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Current Location Display */}
      {currentLocation ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[rgb(var(--text))]">
            <MapPinIconSolid className="w-4 h-4 text-[rgb(var(--brand))]" />
            <span className="font-medium">Current Location</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[rgb(var(--muted))]">Latitude:</span>
              <span className="ml-2 text-[rgb(var(--text))]">{currentLocation.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-[rgb(var(--muted))]">Longitude:</span>
              <span className="ml-2 text-[rgb(var(--text))]">{currentLocation.lng.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-[rgb(var(--muted))]">Accuracy:</span>
              <span className="ml-2 text-[rgb(var(--text))]">
                {currentLocation.accuracy.toFixed(1)}m ({formatAccuracy(currentLocation.accuracy)})
              </span>
            </div>
            <div>
              <span className="text-[rgb(var(--muted))]">Updated:</span>
              <span className="ml-2 text-[rgb(var(--text))]">{formatTimestamp(currentLocation.timestamp)}</span>
            </div>
          </div>
          
          {currentLocation.address && (
            <div className="text-sm">
              <span className="text-[rgb(var(--muted))]">Address:</span>
              <span className="ml-2 text-[rgb(var(--text))]">{currentLocation.address}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <MapPinIcon className="w-12 h-12 text-[rgb(var(--muted))] mx-auto mb-2" />
          <p className="text-[rgb(var(--muted))] text-sm">
            {locationPermission === 'granted' 
              ? 'Click "Start tracking" to get your location'
              : 'Location permission required'
            }
          </p>
        </div>
      )}

      {/* Permission Request */}
      {locationPermission === 'prompt' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Location permission needed</span>
          </div>
          <p className="text-blue-700 text-xs mt-1">
            Allow location access to enable GPS tracking and geofencing features.
          </p>
          <button
            onClick={requestLocationPermission}
            disabled={isLoading}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            {isLoading ? 'Requesting...' : 'Grant Permission'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {locationError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Location Error</span>
          </div>
          <p className="text-red-700 text-xs mt-1">{locationError}</p>
        </div>
      )}

      {/* Geofencing Status */}
      {enableGeofencing && (
        <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))]/20">
          <h4 className="text-sm font-medium text-[rgb(var(--text))] mb-2">Active Geofences</h4>
          <div className="space-y-2">
            {geofences.map(geofence => (
              <div
                key={geofence.id}
                className={`
                  flex items-center justify-between p-2 rounded-lg text-sm
                  ${activeGeofences.has(geofence.id)
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-[rgb(var(--bg))] text-[rgb(var(--muted))]'
                  }
                `}
              >
                <span>{geofence.name}</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs
                  ${activeGeofences.has(geofence.id)
                    ? 'bg-green-200 text-green-800'
                    : 'bg-[rgb(var(--bg))] text-[rgb(var(--muted))]'
                  }
                `}>
                  {activeGeofences.has(geofence.id) ? 'Inside' : 'Outside'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block w-4 h-4 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-[rgb(var(--muted))]">Getting location...</span>
        </div>
      )}
    </div>
  );
}
