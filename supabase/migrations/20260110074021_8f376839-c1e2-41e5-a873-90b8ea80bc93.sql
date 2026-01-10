-- Add expected salary fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN expected_salary_min numeric NULL,
ADD COLUMN expected_salary_max numeric NULL;