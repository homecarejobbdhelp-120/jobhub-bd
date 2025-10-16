-- Add 'nurse' to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'nurse';

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS verified_percentage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS license_number text,
ADD COLUMN IF NOT EXISTS nid_number text,
ADD COLUMN IF NOT EXISTS nid_front_url text,
ADD COLUMN IF NOT EXISTS nid_back_url text,
ADD COLUMN IF NOT EXISTS face_scan_url text,
ADD COLUMN IF NOT EXISTS location text;

-- Update handle_new_user function to support user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
  user_type_value text;
BEGIN
  -- Get user_type from metadata
  user_type_value := COALESCE(NEW.raw_user_meta_data->>'user_type', 'caregiver');
  
  -- Map user_type to app_role
  IF user_type_value = 'company' THEN
    user_role := 'employer'::app_role;
  ELSIF user_type_value = 'nurse' THEN
    user_role := 'nurse'::app_role;
  ELSE
    user_role := 'caregiver'::app_role;
  END IF;
  
  -- Insert into profiles with full_name, username, and company_name
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    username, 
    phone, 
    avatar_url, 
    hide_avatar, 
    verified,
    company_name,
    verified_percentage
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'name', 
      'User'
    ),
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    false,
    NEW.raw_user_meta_data->>'company_name',
    0
  );
  
  -- Insert role into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$function$;