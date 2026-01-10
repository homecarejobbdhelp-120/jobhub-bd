-- Update public_profiles view to include expected salary fields
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
  created_at,
  expected_salary_min,
  expected_salary_max
FROM profiles;