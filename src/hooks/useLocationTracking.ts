import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export function useLocationTracking() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const startLocationTracking = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates
      const address = await reverseGeocode(latitude, longitude);
      
      const location = { latitude, longitude, address };
      setLocationData(location);

      // Update profile with location data
      if (user && profile?.role === 'municipality') {
        await updateLocationInDatabase(location);
        setIsTracking(true);
        
        toast({
          title: "Location Updated",
          description: "Your location has been successfully tracked.",
        });
      }

      return true;
    } catch (error) {
      console.error('Location tracking failed:', error);
      toast({
        title: "Location Access Denied",
        description: "Please enable location access to track your position.",
        variant: "destructive"
      });
      return false;
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const updateLocationInDatabase = async (location: LocationData) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        current_location_lat: location.latitude,
        current_location_lng: location.longitude,
        current_address: location.address,
        last_location_update: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update location in database:', error);
    }
  };

  const stopLocationTracking = async () => {
    setIsTracking(false);
    setLocationData(null);
    
    if (user && profile?.role === 'municipality') {
      const { error } = await supabase
        .from('profiles')
        .update({
          current_location_lat: null,
          current_location_lng: null,
          current_address: null,
          last_location_update: null
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to clear location in database:', error);
      }

      toast({
        title: "Location Tracking Stopped",
        description: "Your location is no longer being tracked.",
      });
    }
  };

  const updateAvailabilityStatus = async (status: 'available' | 'busy' | 'offline') => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ availability_status: status })
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update availability status:', error);
    } else {
      toast({
        title: "Status Updated",
        description: `Your status has been set to ${status}.`,
      });
    }
  };

  // Auto-start tracking for municipality users on login
  useEffect(() => {
    if (user && profile?.role === 'municipality' && !isTracking) {
      startLocationTracking();
    }
  }, [user, profile]);

  return {
    isTracking,
    locationData,
    startLocationTracking,
    stopLocationTracking,
    updateAvailabilityStatus
  };
}