// lib/geocode.ts

export interface GeocodeResult {
  lat: number;
  lng: number;
  place_name: string;
}

/**
 * Forward geocode an address using Mapbox API
 */
export async function forwardGeocode(
  address: string, 
  token: string
): Promise<GeocodeResult | null> {
  if (!address.trim() || !token) return null;
  
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding request failed');
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    const feature = data.features[0];
    const [lng, lat] = feature.center;
    
    return {
      lat,
      lng,
      place_name: feature.place_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
