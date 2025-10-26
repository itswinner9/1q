-- ═══════════════════════════════════════════════════════════════
-- FIX STORAGE POLICIES FOR IMAGE UPLOADS
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor after creating buckets
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Drop all existing storage policies
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- Step 2: Create proper policies for ALL image buckets

-- Policy 1: Anyone can READ/VIEW images (public access)
CREATE POLICY "Public can view all images"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('neighborhood-images', 'building-images', 'review-images')
);

-- Policy 2: Authenticated users can UPLOAD images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('neighborhood-images', 'building-images', 'review-images')
  AND auth.role() = 'authenticated'
);

-- Policy 3: Users can UPDATE their own uploads
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('neighborhood-images', 'building-images', 'review-images')
  AND auth.uid() = owner
);

-- Policy 4: Admins can DELETE any image
CREATE POLICY "Admins can delete any image"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('neighborhood-images', 'building-images', 'review-images')
  AND (
    auth.uid() = owner
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
);

-- Step 3: Verify policies were created
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ STORAGE POLICIES FIXED!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Public can view images';
  RAISE NOTICE '✅ Authenticated users can upload';
  RAISE NOTICE '✅ Users can update own images';
  RAISE NOTICE '✅ Admins can delete any image';
  RAISE NOTICE '';
  RAISE NOTICE 'Now try uploading a cover image!';
  RAISE NOTICE '════════════════════════════════════════';
END $$;


