import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MunicipalityUser {
  id: string;
  full_name: string;
  email: string;
  address: string | null;
  is_online: boolean;
  last_seen: string;
}

export function useMunicipalityPresence() {
  const { user, profile } = useAuth();
  const [municipalityUsers, setMunicipalityUsers] = useState<MunicipalityUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user || profile?.role !== 'government') return;

    // Fetch municipality users
    const fetchMunicipalityUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, address')
        .eq('role', 'municipality');
      
      if (data) {
        const usersWithPresence = data.map(user => ({
          id: user.user_id,
          full_name: user.full_name || user.email,
          email: user.email,
          address: user.address,
          is_online: false,
          last_seen: new Date().toISOString()
        }));
        
        setMunicipalityUsers(usersWithPresence);
      }
    };

    fetchMunicipalityUsers();

    // Set up presence tracking
    const channel = supabase.channel('municipality_presence', {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    // Track presence for municipality users
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const onlineUserIds = Object.keys(newState);
        
        setMunicipalityUsers(prev => 
          prev.map(user => ({
            ...user,
            is_online: onlineUserIds.includes(user.id),
            last_seen: onlineUserIds.includes(user.id) ? new Date().toISOString() : user.last_seen
          }))
        );
        
        setOnlineCount(onlineUserIds.length);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setMunicipalityUsers(prev =>
          prev.map(user =>
            user.id === key 
              ? { ...user, is_online: true, last_seen: new Date().toISOString() }
              : user
          )
        );
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setMunicipalityUsers(prev =>
          prev.map(user =>
            user.id === key 
              ? { ...user, is_online: false }
              : user
          )
        );
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user if they are municipality
          if (profile?.role === 'municipality') {
            await channel.track({
              user_id: user.id,
              full_name: profile.full_name,
              address: profile.address,
              online_at: new Date().toISOString()
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  return {
    municipalityUsers,
    onlineCount,
    totalCount: municipalityUsers.length
  };
}