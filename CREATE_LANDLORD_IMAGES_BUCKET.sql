-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('landlord-images', 'landlord-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access for Landlord Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload landlord images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own landlord images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own landlord images" ON storage.objects;

-- Create policy to allow public read access
CREATE POLICY "Public Access for Landlord Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'landlord-images');

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload landlord images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'landlord-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to update their own uploads
CREATE POLICY "Users can update their own landlord images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'landlord-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own uploads
CREATE POLICY "Users can delete their own landlord images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'landlord-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Landlord images bucket created successfully!';
  RAISE NOTICE 'Bucket ID: landlord-images';
  RAISE NOTICE 'Public access: enabled';
END $$;
