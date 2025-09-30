-- Create job listings table
CREATE TABLE public.job_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  location text,
  department text,
  job_type text NOT NULL DEFAULT 'municipality', -- 'government' or 'municipality'
  salary_range text,
  posted_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL,
  resume_url text,
  cover_letter text,
  contact_phone text,
  status text NOT NULL DEFAULT 'submitted', -- submitted, under_review, selected, rejected, interview_scheduled
  interview_date timestamp with time zone,
  interview_notes text,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id) -- Prevent duplicate applications
);

-- Enable RLS
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- RLS policies for job_listings
CREATE POLICY "Anyone can view active job listings" 
ON public.job_listings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Government can create job listings" 
ON public.job_listings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'government'
) AND auth.uid() = posted_by);

CREATE POLICY "Government can update their job listings" 
ON public.job_listings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'government'
) AND auth.uid() = posted_by);

-- RLS policies for job_applications
CREATE POLICY "Users can view their own applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = applicant_id OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'government'
));

CREATE POLICY "Users can create their own applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Government can update applications" 
ON public.job_applications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'government'
));

-- Storage policies for resumes
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Government can view all resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'government'
));

-- Add triggers for updated_at
CREATE TRIGGER update_job_listings_updated_at
BEFORE UPDATE ON public.job_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();