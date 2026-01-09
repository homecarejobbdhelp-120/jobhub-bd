-- Make certificates bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'certificates';

-- Drop the old public access policy
DROP POLICY IF EXISTS "Certificates are publicly viewable" ON storage.objects;

-- Add controlled access policy for certificates
CREATE POLICY "Controlled certificate access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificates' AND (
    -- Owner can view their own
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Admins can view all
    has_role(auth.uid(), 'admin') OR
    -- Employers can view certificates from their applicants
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.employer_id = auth.uid()
      AND a.caregiver_id::text = (storage.foldername(name))[1]
    )
  )
);