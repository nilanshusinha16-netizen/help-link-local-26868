-- Create storage bucket for request images
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-images', 'request-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload request images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'request-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view request images (public bucket)
CREATE POLICY "Anyone can view request images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'request-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own request images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'request-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own request images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'request-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);