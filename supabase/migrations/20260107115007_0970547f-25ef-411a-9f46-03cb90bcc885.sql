-- Create the identity-docs storage bucket (private - not public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-docs', 'identity-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for identity-docs bucket
-- Only the owner can upload their identity documents
CREATE POLICY "Users can upload their own identity docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'identity-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Only the owner or admins can view identity documents
CREATE POLICY "Users can view their own identity docs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'identity-docs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin')
  )
);

-- Only the owner can update their identity documents
CREATE POLICY "Users can update their own identity docs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'identity-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Only the owner can delete their identity documents
CREATE POLICY "Users can delete their own identity docs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'identity-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);