import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Municipality {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  address: string;
  is_online: boolean;
  last_seen: string | null;
}

export function useMunicipalityMatching() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all municipalities for fallback selection
  const fetchMunicipalities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, address')
        .eq('role', 'municipality')
        .order('full_name');

      if (error) {
        console.error('Error fetching municipalities:', error);
        return [];
      }

      const municipalitiesWithStatus = (data || []).map(m => ({
        ...m,
        is_online: false,
        last_seen: null
      }));

      setMunicipalities(municipalitiesWithStatus);
      return municipalitiesWithStatus;
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Match municipality based on address/location
  const matchMunicipality = async (address: string, latitude?: number, longitude?: number): Promise<Municipality | null> => {
    // Simple matching logic - in production, use proper geospatial matching
    if (!address) return null;

    const addressLower = address.toLowerCase();
    
    // Find municipality with address that contains similar keywords
    const matched = municipalities.find(m => {
      if (!m.address) return false;
      
      const municipalityAddress = m.address.toLowerCase();
      
      // Simple keyword matching - check if they share common location terms
      const addressWords = addressLower.split(/[\s,]+/);
      const municipalityWords = municipalityAddress.split(/[\s,]+/);
      
      // Check for shared significant words (excluding common words)
      const significantWords = addressWords.filter(word => 
        word.length > 3 && !['street', 'avenue', 'road', 'lane', 'drive', 'boulevard'].includes(word)
      );
      
      return significantWords.some(word => 
        municipalityWords.some(mWord => mWord.includes(word) || word.includes(mWord))
      );
    });

    return matched || null;
  };

  // Get the best municipality based on location/address
  const getBestMatch = async (address: string, latitude?: number, longitude?: number): Promise<Municipality | null> => {
    if (municipalities.length === 0) {
      await fetchMunicipalities();
    }
    
    return matchMunicipality(address, latitude, longitude);
  };

  useEffect(() => {
    fetchMunicipalities();
  }, []);

  return {
    municipalities,
    loading,
    matchMunicipality,
    getBestMatch,
    fetchMunicipalities
  };
}