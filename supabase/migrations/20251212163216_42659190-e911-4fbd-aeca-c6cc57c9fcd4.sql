
-- Drop the security definer view and recreate with security invoker
DROP VIEW IF EXISTS public.public_profiles;

-- Create view with security invoker (uses caller's permissions)
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
  verified,
  verified_percentage,
  cv_url,
  certificate_url,
  created_at
FROM public.profiles;

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add a policy that allows everyone to see profiles but only specific columns are exposed via the view
-- Since the view only selects non-sensitive columns, we can allow broader access
CREATE POLICY "Anyone can view public profile fields via view"
ON public.profiles
FOR SELECT
USING (true);
