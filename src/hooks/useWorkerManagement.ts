import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Worker {
  user_id: string;
  full_name: string;
  email: string;
  address: string | null;
  current_location_lat: number | null;
  current_location_lng: number | null;
  current_address: string | null;
  availability_status: string;
  last_location_update: string | null;
  is_online: boolean;
}

export function useWorkerManagement() {
  const { user, profile } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableWorkers = async () => {
    if (!user || profile?.role !== 'government') return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, address, current_location_lat, current_location_lng, current_address, availability_status, last_location_update')
        .eq('role', 'municipality')
        .eq('availability_status', 'available')
        .not('current_location_lat', 'is', null)
        .not('current_location_lng', 'is', null);

      if (error) {
        console.error('Error fetching workers:', error);
        return;
      }

      const workersWithPresence = data?.map(worker => ({
        ...worker,
        is_online: worker.last_location_update ? 
          (new Date().getTime() - new Date(worker.last_location_update).getTime()) < 300000 : // 5 minutes
          false
      })) || [];

      setWorkers(workersWithPresence);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignWorkerToTask = async (
    workerId: string, 
    taskData: {
      reportId: string;
      title: string;
      description?: string;
      address: string;
      latitude?: number;
      longitude?: number;
    }
  ) => {
    if (!user || profile?.role !== 'government') return null;

    try {
      // Create the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          report_id: taskData.reportId,
          assigned_to: workerId,
          assigned_by: user.id,
          status: 'assigned',
          task_location_lat: taskData.latitude,
          task_location_lng: taskData.longitude,
          task_address: taskData.address,
          notes: taskData.description
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        return null;
      }

      // Create notification for the worker
      await createWorkerNotification(workerId, {
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to: ${taskData.title}`,
        data: {
          taskId: task.id,
          reportId: taskData.reportId,
          address: taskData.address
        }
      });

      return task;
    } catch (error) {
      console.error('Error assigning worker to task:', error);
      return null;
    }
  };

  const createWorkerNotification = async (
    workerId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    }
  ) => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: workerId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data
      });

    if (error) {
      console.error('Error creating notification:', error);
    }
  };

  const findClosestWorker = (targetLat: number, targetLng: number): Worker | null => {
    if (workers.length === 0) return null;

    const availableWorkers = workers.filter(worker => 
      worker.is_online && 
      worker.availability_status === 'available' &&
      worker.current_location_lat &&
      worker.current_location_lng
    );

    if (availableWorkers.length === 0) return null;

    let closestWorker = availableWorkers[0];
    let shortestDistance = calculateDistance(
      targetLat, targetLng,
      closestWorker.current_location_lat!, closestWorker.current_location_lng!
    );

    availableWorkers.forEach(worker => {
      const distance = calculateDistance(
        targetLat, targetLng,
        worker.current_location_lat!, worker.current_location_lng!
      );
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestWorker = worker;
      }
    });

    return closestWorker;
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (user && profile?.role === 'government') {
      fetchAvailableWorkers();
      
      // Set up real-time subscription for worker updates
      const channel = supabase
        .channel('worker_management')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            fetchAvailableWorkers();
          }
        )
        .subscribe();

      // Refresh worker data every 30 seconds
      const interval = setInterval(fetchAvailableWorkers, 30000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [user, profile]);

  return {
    workers,
    loading,
    fetchAvailableWorkers,
    assignWorkerToTask,
    findClosestWorker,
    calculateDistance
  };
}