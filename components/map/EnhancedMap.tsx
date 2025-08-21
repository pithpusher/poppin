'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { clusterEvents, getClusterZoom, getClusteringDistance, type Cluster, type EventLocation } from '@/lib/mapClustering';
import ClusterMarker from './ClusterMarker';
import RoutePlanner from './RoutePlanner';
import { useLocation } from './useLocation';

interface EnhancedMapProps {
  events: Array<{
    id: string;
    title: string;
    start_at: string;
    venue_name: string | null;
    lat: number | null;
    lng: number | null;
    image_url: string | null;
    status: string;
    is_free?: boolean | null;
    price_cents?: number | null;
    event_type?: string | null;
    age_restriction?: string | null;
  }>;
  onEventClick?: (eventId: string) => void;
  className?: string;
}

export default function EnhancedMap({ events, onEventClick, className = "" }: EnhancedMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { location: userLocation } = useLocation();
  
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [routeDestination, setRouteDestination] = useState<{
    lat: number;
    lng: number;
    title: string;
    venue_name?: string | null;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState(10);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [-74.006, 40.7128],
      zoom: 10
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocation control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Handle zoom changes
    const handleZoom = () => {
      if (map.current) {
        setMapZoom(map.current.getZoom());
      }
    };

    map.current.on('zoom', handleZoom);
    map.current.on('moveend', handleZoom);

    return () => {
      if (map.current) {
        map.current.off('zoom', handleZoom);
        map.current.off('moveend', handleZoom);
        map.current.remove();
      }
    };
  }, [userLocation]);

  // Update clusters when events or zoom changes
  useEffect(() => {
    if (!map.current) return;

    const validEvents: EventLocation[] = events
      .filter(event => event.lat !== null && event.lng !== null)
      .map(event => ({
        id: event.id,
        lat: event.lat!,
        lng: event.lng!,
        ...event
      }));

    const clusteringDistance = getClusteringDistance(mapZoom);
    const newClusters = clusterEvents(validEvents, clusteringDistance);
    setClusters(newClusters);
  }, [events, mapZoom]);

  // Handle cluster click
  const handleClusterClick = useCallback((center: [number, number], clusterEvents: any[]) => {
    if (!map.current) return;

    if (clusterEvents.length === 1) {
      // Single event, zoom to it
      map.current.flyTo({
        center,
        zoom: 15,
        duration: 1000
      });
    } else {
      // Multiple events, zoom to fit all
      const bounds = new mapboxgl.LngLatBounds();
      clusterEvents.forEach(event => {
        bounds.extend([event.lng, event.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: getClusterZoom(clusterEvents.length),
        duration: 1000
      });
    }
  }, []);

  // Handle event click
  const handleEventClick = useCallback((eventId: string) => {
    onEventClick?.(eventId);
  }, [onEventClick]);

  // Handle route planning
  const handleRoutePlanning = useCallback((event: any) => {
    setRouteDestination({
      lat: event.lat,
      lng: event.lng,
      title: event.title,
      venue_name: event.venue_name
    });
    setIsRoutePlannerOpen(true);
  }, []);

  // Close route planner
  const handleCloseRoutePlanner = useCallback(() => {
    setIsRoutePlannerOpen(false);
    setRouteDestination(null);
  }, []);

  return (
    <div className={className}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-96 md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden"
      />

      {/* Cluster Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {clusters.map((cluster) => (
          <div
            key={`${cluster.center[0]}-${cluster.center[1]}-${cluster.count}`}
            className="absolute pointer-events-auto"
            style={{
              left: `${((cluster.center[1] + 180) / 360) * 100}%`,
              top: `${((90 - cluster.center[0]) / 180) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <ClusterMarker
              count={cluster.count}
              center={cluster.center}
              events={cluster.events}
              onClusterClick={handleClusterClick}
              onEventClick={handleEventClick}
            />
          </div>
        ))}
      </div>

      {/* Route Planning Button */}
      {selectedCluster && selectedCluster.count === 1 && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => handleRoutePlanning(selectedCluster.events[0])}
            className="px-4 py-2 bg-[rgb(var(--brand))] text-white font-medium rounded-lg shadow-lg hover:bg-[rgb(var(--brand))]/90 transition-colors flex items-center gap-2"
          >
            <span>🚗</span>
            Get Directions
          </button>
        </div>
      )}

      {/* Route Planner Modal */}
      <RoutePlanner
        destination={routeDestination}
        isOpen={isRoutePlannerOpen}
        onClose={handleCloseRoutePlanner}
        userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null}
      />

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        {/* Cluster Info */}
        <div className="bg-[rgb(var(--panel))] rounded-lg p-3 shadow-lg border border-[rgb(var(--border-color))]/20">
          <div className="text-sm font-medium text-[rgb(var(--text))] mb-2">
            Map View
          </div>
          <div className="space-y-1 text-xs text-[rgb(var(--muted))]">
            <div>Zoom: {mapZoom.toFixed(1)}</div>
            <div>Events: {events.length}</div>
            <div>Clusters: {clusters.length}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[rgb(var(--panel))] rounded-lg p-3 shadow-lg border border-[rgb(var(--border-color))]/20">
          <div className="text-sm font-medium text-[rgb(var(--text))] mb-2">
            Legend
          </div>
                     <div className="space-y-2 text-xs">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-600"></div>
               <span className="text-[rgb(var(--muted))]">Single Event</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <span className="text-[rgb(var(--muted))]">Small Cluster (2-5)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-orange-500"></div>
               <span className="text-[rgb(var(--muted))]">Medium Cluster (6-10)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
               <span className="text-[rgb(var(--muted))]">Large Cluster (10+)</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
