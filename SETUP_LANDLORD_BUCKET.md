# Setup Landlord Images Bucket

## Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** button
4. Configure the bucket:
   - **Name**: `landlord-images`
   - **Public bucket**: ✅ Enable (check this box)
5. Click **"Create bucket"**

## Method 2: Using SQL (Alternative)

Run this SQL in the Supabase SQL Editor:

```sql
-- Create bucket for landlord images
INSERT INTO storage.buckets (id, name, public)
VALUES ('landlord-images', 'landlord-images', true)
ON CONFLICT (id) DO NOTHING;
```

## After Creating the Bucket

Run this SQL to create the policies:

```sql
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
```

## Verify Setup

1. Go to **Storage** → **Buckets**
2. You should see `landlord-images` bucket
3. Click on it to view files
4. The bucket should show "Public" badge

## Usage

After setup, you can upload landlord images using:
- Bucket ID: `landlord-images`
- Public URL format: `https://your-project.supabase.co/storage/v1/object/public/landlord-images/filename.jpg`
