-- Create follows table for the follow system
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

-- Enable Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Users can view follows"
ON public.follows
FOR SELECT
USING (true);

CREATE POLICY "Users can create follows"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Enable realtime for follows table
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;

-- Update the notify_caregivers_new_job function to also notify followers
CREATE OR REPLACE FUNCTION public.notify_followers_on_new_job()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notifications for all followers of this company
  INSERT INTO public.notifications (user_id, title, message, job_id)
  SELECT 
    f.follower_id,
    'New Job from ' || COALESCE(NEW.company_name, 'a company you follow'),
    NEW.title || ' in ' || NEW.location,
    NEW.id
  FROM public.follows f
  WHERE f.following_id = NEW.employer_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to notify followers: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for follower notifications
DROP TRIGGER IF EXISTS on_new_job_notify_followers ON public.jobs;

CREATE TRIGGER on_new_job_notify_followers
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_followers_on_new_job();