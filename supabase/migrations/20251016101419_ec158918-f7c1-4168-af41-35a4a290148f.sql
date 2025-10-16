-- Add company_name and contact_email to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Update existing records to have empty strings for backward compatibility
UPDATE public.jobs 
SET company_name = COALESCE(company_name, ''),
    contact_email = COALESCE(contact_email, '')
WHERE company_name IS NULL OR contact_email IS NULL;

-- Make salary nullable (it's already nullable but ensuring it)
ALTER TABLE public.jobs 
ALTER COLUMN salary DROP NOT NULL;