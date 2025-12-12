-- Create a database webhook trigger function to call the edge function
CREATE OR REPLACE FUNCTION public.notify_caregivers_new_job()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload json;
BEGIN
  -- Build the payload
  payload := json_build_object(
    'type', 'INSERT',
    'table', TG_TABLE_NAME,
    'record', json_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'description', NEW.description,
      'location', NEW.location,
      'salary', NEW.salary,
      'company_name', NEW.company_name,
      'job_type', NEW.job_type,
      'shift_type', NEW.shift_type
    )
  );
  
  -- Call the edge function using pg_net extension
  PERFORM net.http_post(
    url := 'https://kmthjcwipphhziyicgzg.supabase.co/functions/v1/send-job-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := payload::jsonb
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the insert
    RAISE WARNING 'Failed to send job alert: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger on jobs table
DROP TRIGGER IF EXISTS on_new_job_notify_caregivers ON public.jobs;

CREATE TRIGGER on_new_job_notify_caregivers
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_caregivers_new_job();