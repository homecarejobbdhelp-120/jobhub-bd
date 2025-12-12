-- Revoke anonymous access to public_profiles view - require authentication
REVOKE SELECT ON public.public_profiles FROM anon;

-- Keep authenticated access
GRANT SELECT ON public.public_profiles TO authenticated;