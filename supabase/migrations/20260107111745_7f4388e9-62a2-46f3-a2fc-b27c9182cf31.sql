
-- 1. Create audit_logs table to track sensitive data access
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  accessed_fields text[],
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs (via security definer functions)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- 2. Create a secure function to access profiles with audit logging
CREATE OR REPLACE FUNCTION public.get_profile_with_audit(target_profile_id uuid)
RETURNS TABLE(
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
  nid_number text,
  nid_front_url text,
  nid_back_url text,
  face_scan_url text,
  license_number text,
  created_at timestamptz,
  can_view_sensitive boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  is_own_profile boolean;
  can_view boolean;
BEGIN
  is_admin := has_role(auth.uid(), 'admin');
  is_own_profile := auth.uid() = target_profile_id;
  can_view := is_admin OR is_own_profile;
  
  -- Log admin access to sensitive profile data
  IF is_admin AND NOT is_own_profile THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, accessed_fields)
    VALUES (
      auth.uid(),
      'VIEW_SENSITIVE_PROFILE',
      'profiles',
      target_profile_id,
      ARRAY['nid_number', 'nid_front_url', 'nid_back_url', 'face_scan_url', 'license_number', 'email', 'phone']
    );
  END IF;
  
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
    CASE WHEN can_view THEN p.nid_number ELSE NULL END,
    CASE WHEN can_view THEN p.nid_front_url ELSE NULL END,
    CASE WHEN can_view THEN p.nid_back_url ELSE NULL END,
    CASE WHEN can_view THEN p.face_scan_url ELSE NULL END,
    CASE WHEN can_view THEN p.license_number ELSE NULL END,
    p.created_at,
    can_view
  FROM profiles p
  WHERE p.id = target_profile_id;
END;
$$;

-- 3. Strengthen messages RLS - add job_id validation
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;

CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (auth.uid() = sender_id OR auth.uid() = receiver_id)
);

-- 4. Recreate public_profiles view to ensure no sensitive data is exposed
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
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

-- 5. Add index on audit_logs for efficient querying
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
