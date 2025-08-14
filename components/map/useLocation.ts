import { useEffect, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
}

const SAN_FRANCISCO_COORDS: Location = {
  lat: 37.77,
  lng: -122.46
};

export function useLocation() {
  const [location, setLocation] = useState<Location>(SAN_FRANCISCO_COORDS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser');
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
          setError(null);
        },
        (error) => {
          console.log('Location access denied or error occurred:', error.message);
          // Fallback to San Francisco coordinates
          setLocation(SAN_FRANCISCO_COORDS);
          setIsLoading(false);
          setError('Location access denied, showing San Francisco area');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };

    requestLocation();
  }, []);

  return { location, isLoading, error };
}
