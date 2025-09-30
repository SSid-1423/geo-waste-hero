import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface JobListing {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  department: string | null;
  job_type: string;
  salary_range: string | null;
  posted_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url: string | null;
  cover_letter: string | null;
  contact_phone: string | null;
  status: string;
  interview_date: string | null;
  interview_notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  job_listings?: Partial<JobListing>;
  profiles?: {
    full_name: string | null;
    email: string;
    phone: string | null;
  };
}

export function useJobs() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user || profile?.role !== 'government') return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_listings (
            title,
            department,
            job_type
          )
        `)
        .order('created_at', { ascending: false });

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(app => app.applicant_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, phone')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Merge profiles with applications
        const applicationsWithProfiles = data.map(app => ({
          ...app,
          profiles: profiles?.find(p => p.user_id === app.applicant_id)
        }));

        setApplications(applicationsWithProfiles);
      } else {
        setApplications(data || []);
      }

    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_listings (
            title,
            department,
            job_type,
            location
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching my applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Omit<JobListing, 'id' | 'posted_by' | 'is_active' | 'created_at' | 'updated_at'>) => {
    if (!user || profile?.role !== 'government') return false;

    try {
      const { error } = await supabase
        .from('job_listings')
        .insert({
          ...jobData,
          posted_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job listing created successfully",
      });

      await fetchJobs();
      return true;
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create job listing",
        variant: "destructive",
      });
      return false;
    }
  };

  const applyToJob = async (
    jobId: string,
    applicationData: {
      resume_url?: string;
      cover_letter?: string;
      contact_phone?: string;
    }
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          ...applicationData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application submitted successfully",
      });

      await fetchMyApplications();
      return true;
    } catch (error) {
      console.error('Error applying to job:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: string,
    interviewDate?: string,
    notes?: string
  ) => {
    if (!user || profile?.role !== 'government') return false;

    try {
      const updateData: any = {
        status,
        reviewed_by: user.id,
      };

      if (interviewDate) {
        updateData.interview_date = interviewDate;
      }

      if (notes) {
        updateData.interview_notes = notes;
      }

      const { error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });

      await fetchApplications();
      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadResume = async (file: File) => {
    if (!user) return null;

    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
      if (profile?.role === 'government') {
        fetchApplications();
      } else {
        fetchMyApplications();
      }
    }
  }, [user, profile]);

  return {
    jobs,
    applications,
    loading,
    fetchJobs,
    fetchApplications,
    fetchMyApplications,
    createJob,
    applyToJob,
    updateApplicationStatus,
    uploadResume,
  };
}