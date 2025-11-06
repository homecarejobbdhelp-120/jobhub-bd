-- Create trigger to auto-populate profiles and user_roles on new user signups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created' AND c.relname = 'users' AND n.nspname = 'auth'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Backfill profiles and user_roles for existing users that might be missing
DO $$
DECLARE
  u RECORD;
  mapped_role app_role;
  user_type text;
BEGIN
  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    user_type := COALESCE(u.raw_user_meta_data->>'user_type', 'caregiver');

    IF user_type = 'company' THEN
      mapped_role := 'employer'::app_role;
    ELSIF user_type = 'nurse' THEN
      mapped_role := 'nurse'::app_role;
    ELSE
      mapped_role := 'caregiver'::app_role;
    END IF;

    -- Insert profile if missing
    INSERT INTO public.profiles (
      id, email, name, username, phone, avatar_url, hide_avatar, verified, company_name, verified_percentage
    )
    SELECT 
      u.id,
      u.email,
      COALESCE(
        u.raw_user_meta_data->>'full_name', 
        u.raw_user_meta_data->>'company_name',
        u.raw_user_meta_data->>'name', 
        'User'
      ),
      u.raw_user_meta_data->>'username',
      u.raw_user_meta_data->>'phone',
      u.raw_user_meta_data->>'avatar_url',
      false,
      false,
      u.raw_user_meta_data->>'company_name',
      0
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

    -- Insert role if missing
    INSERT INTO public.user_roles (user_id, role)
    SELECT u.id, mapped_role
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id);
  END LOOP;
END $$;