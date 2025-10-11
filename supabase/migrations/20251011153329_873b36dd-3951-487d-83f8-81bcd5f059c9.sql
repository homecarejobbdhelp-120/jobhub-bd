-- Fix function search_path for expire_old_jobs
DROP FUNCTION IF EXISTS expire_old_jobs();

CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
  SET status = 'expired'
  WHERE status = 'open'
  AND (
    end_date < CURRENT_DATE OR
    created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days')
  );
END;
$$;
