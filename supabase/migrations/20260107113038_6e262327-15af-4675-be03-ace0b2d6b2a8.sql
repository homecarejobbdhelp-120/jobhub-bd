
-- 1. Fix the permissive INSERT policy on audit_logs 
-- Only security definer functions should insert, so we restrict to service role
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- No direct INSERT allowed - only via security definer functions
-- The get_profile_with_audit function uses SECURITY DEFINER so it can insert

-- 2. Fix the public_profiles view - remove SECURITY DEFINER by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  username,
  avatar_url,
  hide_avatar,
  company_name,
  location,
  skills,
  shift_preferences,
  gender,
  age,
  height_ft,
  height_cm,
  weight_kg,
  marital_status,
  cv_url,
  certificate_url,
  verified,
  verified_percentage,
  created_at
FROM profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;
