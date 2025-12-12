
-- Drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can view their own complete profile
CREATE POLICY "Users can view own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create a view for public profile data (non-sensitive fields only)
-- This excludes: email, phone, nid_number, nid_front_url, nid_back_url, face_scan_url, license_number
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Create a function to check if a user can view contact info of another user
CREATE OR REPLACE FUNCTION public.can_view_contact_info(target_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Users can always view their own contact info
  IF auth.uid() = target_profile_id THEN
    RETURN true;
  END IF;
  
  -- Admins can view all contact info
  IF has_role(auth.uid(), 'admin') THEN
    RETURN true;
  END IF;
  
  -- Companies can view contact info of caregivers who applied to their jobs
  IF has_role(auth.uid(), 'employer') THEN
    RETURN EXISTS (
      SELECT 1 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.caregiver_id = target_profile_id
      AND j.employer_id = auth.uid()
    );
  END IF;
  
  RETURN false;
END;
$$;

-- Create a function to get a profile with conditional contact info
CREATE OR REPLACE FUNCTION public.get_profile_with_contact(target_profile_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  username text,
  avatar_url text,
  hide_avatar boolean,
  company_name text,
  location text,
  skills text[],
  shift_preferences text[],
  gender text,
  age integer,
  height_ft numeric,
  height_cm numeric,
  weight_kg numeric,
  marital_status text,
  verified boolean,
  verified_percentage integer,
  cv_url text,
  certificate_url text,
  created_at timestamptz,
  can_view_contact boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_view boolean;
BEGIN
  can_view := can_view_contact_info(target_profile_id);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    CASE WHEN can_view THEN p.email ELSE NULL END,
    CASE WHEN can_view THEN p.phone ELSE NULL END,
    p.username,
    p.avatar_url,
    p.hide_avatar,
    p.company_name,
    p.location,
    p.skills,
    p.shift_preferences,
    p.gender,
    p.age,
    p.height_ft,
    p.height_cm,
    p.weight_kg,
    p.marital_status,
    p.verified,
    p.verified_percentage,
    p.cv_url,
    p.certificate_url,
    p.created_at,
    can_view
  FROM profiles p
  WHERE p.id = target_profile_id;
END;
$$;
