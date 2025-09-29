import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export function useLocation() {
  const { user } = useAuth();
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Request location permission and get coordinates
  const requestLocation = async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return null;
    }

    setIsLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);
      
      const locationData = { latitude, longitude, address };
      setLocationData(locationData);
      setPermissionGranted(true);
      
      return locationData;
    } catch (error) {
      console.log('Location access denied or failed:', error);
      setPermissionGranted(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple reverse geocoding (in production, use a proper service like Google Maps or Mapbox)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // For demo purposes, generate a mock address based on coordinates
      // In production, use actual reverse geocoding service
      const mockCities = [
        'Downtown', 'Uptown', 'Midtown', 'East Side', 'West Side', 
        'North End', 'South Side', 'Central', 'Heights', 'Gardens'
      ];
      const mockStreets = [
        'Main St', 'Oak Ave', 'Pine St', 'Elm Dr', 'Maple Ln',
        'Cedar Blvd', 'Park Ave', 'First St', 'Second Ave', 'Third St'
      ];
      
      const cityIndex = Math.floor(Math.abs(lat * lng) * 100) % mockCities.length;
      const streetIndex = Math.floor(Math.abs(lat + lng) * 100) % mockStreets.length;
      const number = Math.floor(Math.abs(lat * 1000) % 9999) + 1;
      
      return `${number} ${mockStreets[streetIndex]}, ${mockCities[cityIndex]}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Auto-request location for logged-in users
  useEffect(() => {
    if (user && permissionGranted === null) {
      // Auto-request location for logged-in users
      requestLocation();
    }
  }, [user]);

  return {
    locationData,
    isLoading,
    permissionGranted,
    requestLocation,
    reverseGeocode
  };
}