// Map clustering utility for grouping nearby events

export interface EventLocation {
  id: string;
  lat: number;
  lng: number;
  [key: string]: any;
}

export interface Cluster {
  center: [number, number];
  events: EventLocation[];
  count: number;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Group events into clusters based on proximity
 */
export function clusterEvents(
  events: EventLocation[],
  maxDistance: number = 0.5, // Maximum distance in kilometers for clustering
  minClusterSize: number = 2 // Minimum events to form a cluster
): Cluster[] {
  if (events.length === 0) return [];

  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  for (const event of events) {
    if (processed.has(event.id)) continue;

    // Find nearby events
    const nearbyEvents: EventLocation[] = [event];
    processed.add(event.id);

    for (const otherEvent of events) {
      if (processed.has(otherEvent.id)) continue;

      const distance = calculateDistance(
        event.lat, event.lng,
        otherEvent.lat, otherEvent.lng
      );

      if (distance <= maxDistance) {
        nearbyEvents.push(otherEvent);
        processed.add(otherEvent.id);
      }
    }

    // Calculate cluster center
    const totalLat = nearbyEvents.reduce((sum, e) => sum + e.lat, 0);
    const totalLng = nearbyEvents.reduce((sum, e) => sum + e.lng, 0);
    const center: [number, number] = [
      totalLat / nearbyEvents.length,
      totalLng / nearbyEvents.length
    ];

    if (nearbyEvents.length >= minClusterSize) {
      // Create cluster
      clusters.push({
        center,
        events: nearbyEvents,
        count: nearbyEvents.length
      });
    } else {
      // Single event, create individual cluster
      clusters.push({
        center: [event.lat, event.lng],
        events: [event],
        count: 1
      });
    }
  }

  return clusters;
}

/**
 * Get optimal zoom level for a cluster
 */
export function getClusterZoom(count: number): number {
  if (count === 1) return 15; // Individual event
  if (count <= 5) return 14;  // Small cluster
  if (count <= 10) return 13; // Medium cluster
  if (count <= 25) return 12; // Large cluster
  return 11; // Very large cluster
}

/**
 * Filter clusters based on current map bounds
 */
export function filterClustersByBounds(
  clusters: Cluster[],
  bounds: { north: number; south: number; east: number; west: number }
): Cluster[] {
  return clusters.filter(cluster => {
    const [lat, lng] = cluster.center;
    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  });
}

/**
 * Sort clusters by relevance (proximity to center, event count, etc.)
 */
export function sortClustersByRelevance(
  clusters: Cluster[],
  centerLat: number,
  centerLng: number
): Cluster[] {
  return clusters.sort((a, b) => {
    // Prioritize larger clusters
    if (a.count !== b.count) {
      return b.count - a.count;
    }

    // Then by distance to center
    const distA = calculateDistance(centerLat, centerLng, a.center[0], a.center[1]);
    const distB = calculateDistance(centerLat, centerLng, b.center[0], b.center[1]);
    return distA - distB;
  });
}

/**
 * Get cluster color based on event count
 */
export function getClusterColor(count: number): string {
  if (count === 1) return '#dc2626'; // Red-600 for single events
  if (count <= 5) return '#ef4444';  // Red-500 for small clusters
  if (count <= 10) return '#f97316'; // Orange-500 for medium clusters
  return '#eab308'; // Yellow-500 for large clusters
}

/**
 * Calculate optimal clustering distance based on zoom level
 */
export function getClusteringDistance(zoom: number): number {
  if (zoom >= 15) return 0.1;  // Very close clustering at high zoom
  if (zoom >= 13) return 0.25; // Close clustering
  if (zoom >= 11) return 0.5;  // Medium clustering
  if (zoom >= 9) return 1.0;   // Far clustering
  return 2.0;                   // Very far clustering at low zoom
}
