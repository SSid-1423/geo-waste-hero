-- Add location tracking for municipality workers
ALTER TABLE public.profiles 
ADD COLUMN current_location_lat NUMERIC,
ADD COLUMN current_location_lng NUMERIC,
ADD COLUMN current_address TEXT,
ADD COLUMN availability_status TEXT DEFAULT 'available',
ADD COLUMN last_location_update TIMESTAMP WITH TIME ZONE;

-- Add location data to tasks table for better tracking
ALTER TABLE public.tasks
ADD COLUMN task_location_lat NUMERIC,
ADD COLUMN task_location_lng NUMERIC,
ADD COLUMN task_address TEXT;

-- Create notifications table for worker notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Government can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role = 'government'
));

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for notifications timestamp
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();