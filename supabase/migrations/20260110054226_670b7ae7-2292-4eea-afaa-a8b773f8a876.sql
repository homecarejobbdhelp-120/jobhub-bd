-- Add policy to allow authenticated users to view any public profile data
-- This policy allows SELECT access to non-sensitive fields (the public_profiles view handles which fields are exposed)
CREATE POLICY "Authenticated users can view public profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);