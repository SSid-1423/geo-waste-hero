import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WasteReport {
  id: string;
  reporter_id: string;
  title: string;
  description: string | null;
  waste_type: 'dry' | 'wet' | 'hazardous' | 'electronic' | 'medical';
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  status: 'pending' | 'verified' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  photo_urls: string[] | null;
  verified_by: string | null;
  assigned_to: string | null;
  verified_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  report_id: string;
  assigned_to: string;
  assigned_by: string;
  status: 'assigned' | 'in_progress' | 'completed';
  notes: string | null;
  completion_photo_urls: string[] | null;
  estimated_completion: string | null;
  actual_completion: string | null;
  created_at: string;
  updated_at: string;
}

export function useRealTimeUpdates() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    // Initial data fetch
    fetchInitialData();

    // Set up real-time subscriptions
    const reportsChannel = supabase
      .channel('waste_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waste_reports'
        },
        (payload) => {
          handleReportChange(payload);
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          handleTaskChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [user, profile]);

  const fetchInitialData = async () => {
    if (!user || !profile) return;

    try {
      // Fetch reports based on role
      let reportsQuery = supabase.from('waste_reports').select('*');
      
      if (profile.role === 'citizen') {
        reportsQuery = reportsQuery.eq('reporter_id', user.id);
      }
      
      const { data: reportsData, error: reportsError } = await reportsQuery
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
      } else {
        setReports((reportsData || []) as WasteReport[]);
      }

      // Fetch tasks for municipality and government
      if (profile.role === 'municipality' || profile.role === 'government') {
        let tasksQuery = supabase.from('tasks').select('*');
        
        if (profile.role === 'municipality') {
          tasksQuery = tasksQuery.eq('assigned_to', user.id);
        }
        
        const { data: tasksData, error: tasksError } = await tasksQuery
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
        } else {
          setTasks((tasksData || []) as Task[]);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        setReports(prev => [newRecord, ...prev]);
        break;
      case 'UPDATE':
        setReports(prev => 
          prev.map(report => 
            report.id === newRecord.id ? newRecord : report
          )
        );
        break;
      case 'DELETE':
        setReports(prev => 
          prev.filter(report => report.id !== oldRecord.id)
        );
        break;
    }
  };

  const handleTaskChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        setTasks(prev => [newRecord, ...prev]);
        break;
      case 'UPDATE':
        setTasks(prev => 
          prev.map(task => 
            task.id === newRecord.id ? newRecord : task
          )
        );
        break;
      case 'DELETE':
        setTasks(prev => 
          prev.filter(task => task.id !== oldRecord.id)
        );
        break;
    }
  };

  const createReport = async (reportData: {
    title: string;
    description?: string;
    waste_type: 'dry' | 'wet' | 'hazardous' | 'electronic' | 'medical';
    location_lat?: number;
    location_lng?: number;
    address?: string;
    photo_urls?: string[];
  }) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    try {
      const { error } = await supabase
        .from('waste_reports')
        .insert({
          ...reportData,
          reporter_id: user.id
        });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateReportStatus = async (reportId: string, status: WasteReport['status'], notes?: string) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    try {
      const updates: any = { status };
      
      if (status === 'verified') {
        updates.verified_by = user.id;
        updates.verified_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('waste_reports')
        .update(updates)
        .eq('id', reportId);

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const createTask = async (taskData: {
    report_id: string;
    assigned_to: string;
    notes?: string;
    estimated_completion?: string;
  }) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          assigned_by: user.id
        });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status'], notes?: string, photoUrls?: string[]) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    try {
      const updates: any = { status };
      
      if (notes) updates.notes = notes;
      if (photoUrls) updates.completion_photo_urls = photoUrls;
      if (status === 'completed') {
        updates.actual_completion = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    reports,
    tasks,
    loading,
    createReport,
    updateReportStatus,
    createTask,
    updateTaskStatus,
    refetch: fetchInitialData
  };
}