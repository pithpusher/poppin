import { Loader } from '@googlemaps/js-api-loader';

let placesService: google.maps.places.PlacesService | null = null;
let map: google.maps.Map | null = null;

export interface VenueSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
}

export async function initializeGooglePlaces(): Promise<void> {
  if (placesService) return; // Already initialized

  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    version: 'weekly',
    libraries: ['places']
  });

  try {
    const google = await loader.load();
    
    // Create a hidden map div for the Places service
    const mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);
    
    map = new google.maps.Map(mapDiv, {
      center: { lat: 39.7285, lng: -121.8375 }, // Chico, CA
      zoom: 13
    });
    
    placesService = new google.maps.places.PlacesService(map);
  } catch (error) {
    console.error('Failed to initialize Google Places:', error);
    throw new Error('Google Places initialization failed');
  }
}

export async function searchVenues(query: string): Promise<VenueSearchResult[]> {
  if (!placesService) {
    await initializeGooglePlaces();
  }

  return new Promise((resolve, reject) => {
    if (!placesService) {
      reject(new Error('Places service not initialized'));
      return;
    }

    const request: google.maps.places.TextSearchRequest = {
      query: query,
      location: new google.maps.LatLng(39.7285, -121.8375), // Chico, CA
      radius: 50000, // 50km radius
      type: 'establishment'
    };

    placesService.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const venues: VenueSearchResult[] = results.map(place => ({
          place_id: place.place_id || '',
          name: place.name || '',
          formatted_address: place.formatted_address || '',
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          types: place.types || [],
          rating: place.rating,
          user_ratings_total: place.user_ratings_total
        }));
        resolve(venues);
      } else {
        console.error('Places search failed:', status);
        resolve([]);
      }
    });
  });
}

export async function getVenueDetails(placeId: string): Promise<VenueSearchResult | null> {
  if (!placesService) {
    await initializeGooglePlaces();
  }

  return new Promise((resolve, reject) => {
    if (!placesService) {
      reject(new Error('Places service not initialized'));
      return;
    }

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'geometry', 'types', 'rating', 'user_ratings_total']
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const venue: VenueSearchResult = {
          place_id: place.place_id || '',
          name: place.name || '',
          formatted_address: place.formatted_address || '',
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          types: place.types || [],
          rating: place.rating,
          user_ratings_total: place.user_ratings_total
        };
        resolve(venue);
      } else {
        console.error('Place details failed:', status);
        resolve(null);
      }
    });
  });
}
