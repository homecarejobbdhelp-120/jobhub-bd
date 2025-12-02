-- Add new profile fields for enhanced caregiver profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS height_ft numeric,
ADD COLUMN IF NOT EXISTS height_cm numeric,
ADD COLUMN IF NOT EXISTS weight_kg numeric,
ADD COLUMN IF NOT EXISTS marital_status text,
ADD COLUMN IF NOT EXISTS shift_preferences text[],
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS cv_url text,
ADD COLUMN IF NOT EXISTS certificate_url text;

-- Add check constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_gender CHECK (gender IN ('male', 'female') OR gender IS NULL),
ADD CONSTRAINT valid_marital_status CHECK (marital_status IN ('single', 'married', 'separated') OR marital_status IS NULL);

-- Create storage policies for CVs bucket (already exists, add upload policies)
CREATE POLICY "Users can upload own CV"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own CV"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own CV"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own CV"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create certificates bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for certificates
CREATE POLICY "Users can upload own certificate"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Certificates are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "Users can update own certificate"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certificates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own certificate"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certificates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);