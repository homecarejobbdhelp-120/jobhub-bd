-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'employer', 'caregiver');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Drop all policies that depend on profiles.role column
DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Caregivers can create applications" ON public.applications;
DROP POLICY IF EXISTS "Caregivers can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.job_comments;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;

-- Now we can safely drop the role column
ALTER TABLE public.profiles DROP COLUMN role;

-- Update handle_new_user function to use user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from metadata, default to caregiver
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'caregiver'::app_role);
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, name, phone, avatar_url, hide_avatar, verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    false
  );
  
  -- Insert role into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;

-- Recreate RLS policies using has_role function
CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any comment"
ON public.job_comments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
  auth.uid() = employer_id AND 
  public.has_role(auth.uid(), 'employer')
);

CREATE POLICY "Caregivers can create applications"
ON public.applications
FOR INSERT
WITH CHECK (
  auth.uid() = caregiver_id AND 
  public.has_role(auth.uid(), 'caregiver')
);

CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
ON public.reports
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Recreate storage policy for CVs
CREATE POLICY "Caregivers can upload CVs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' AND 
  public.has_role(auth.uid(), 'caregiver') AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add patient_details column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS patient_details TEXT;

-- Migrate existing seed data roles to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'employer'::app_role FROM auth.users WHERE email LIKE 'employer%@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'caregiver'::app_role FROM auth.users WHERE email LIKE 'caregiver%@example.com'
ON CONFLICT (user_id, role) DO NOTHING;