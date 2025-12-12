-- Remove the overly permissive policy that exposes all columns
DROP POLICY IF EXISTS "Anyone can view public profile fields via view" ON public.profiles;

-- The existing policies are correct:
-- "Users can view own complete profile" - users see their own data
-- "Admins can view all profiles" - admins have full access
-- The public_profiles view (with security_invoker) correctly excludes sensitive columns

-- For contact info access, the can_view_contact_info and get_profile_with_contact functions
-- already implement the correct logic:
-- - Users can see their own contact info
-- - Admins can see all contact info  
-- - Companies can see contact info of caregivers who applied to their jobs