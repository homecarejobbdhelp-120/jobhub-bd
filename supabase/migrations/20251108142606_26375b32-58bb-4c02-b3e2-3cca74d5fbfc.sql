-- Securely (re)define handle_new_user with SECURITY DEFINER and empty search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role public.app_role;
  user_type_value text;
BEGIN
  -- Get user_type from metadata
  user_type_value := COALESCE(NEW.raw_user_meta_data->>'user_type', 'caregiver');
  
  -- Map user_type to app_role
  IF user_type_value = 'company' THEN
    user_role := 'employer'::public.app_role;
  ELSIF user_type_value = 'nurse' THEN
    user_role := 'nurse'::public.app_role;
  ELSE
    user_role := 'caregiver'::public.app_role;
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
$$;

-- Ensure trigger exists and uses this function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();