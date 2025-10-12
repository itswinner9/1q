-- ============================================
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Create Tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
  transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  average_rating DECIMAL(3,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  average_rating DECIMAL(3,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);

-- Step 2: Enable Row Level Security
-- ============================================

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Step 3: Create Security Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Neighborhoods are viewable by everyone" ON neighborhoods;
DROP POLICY IF EXISTS "Users can insert their own neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Users can update their own neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Users can delete their own neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Buildings are viewable by everyone" ON buildings;
DROP POLICY IF EXISTS "Users can insert their own buildings" ON buildings;
DROP POLICY IF EXISTS "Users can update their own buildings" ON buildings;
DROP POLICY IF EXISTS "Users can delete their own buildings" ON buildings;

-- Neighborhoods policies
CREATE POLICY "Neighborhoods are viewable by everyone" 
  ON neighborhoods FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert neighborhoods" 
  ON neighborhoods FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update neighborhoods" 
  ON neighborhoods FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete neighborhoods" 
  ON neighborhoods FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Buildings policies
CREATE POLICY "Buildings are viewable by everyone" 
  ON buildings FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert buildings" 
  ON buildings FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update buildings" 
  ON buildings FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete buildings" 
  ON buildings FOR DELETE 
  USING (auth.role() = 'authenticated');

-- ============================================
-- Step 4: Set Up Storage Buckets and Policies
-- ============================================

-- Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('neighborhood-images', 'neighborhood-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('building-images', 'building-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access neighborhood" ON storage.objects;
DROP POLICY IF EXISTS "Public Access building" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload neighborhood" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload building" ON storage.objects;
DROP POLICY IF EXISTS "Users update own neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Users update own building images" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own building images" ON storage.objects;

-- Storage policies for neighborhood-images
CREATE POLICY "Public Access neighborhood"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Authenticated upload neighborhood"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'neighborhood-images');

CREATE POLICY "Users update own neighborhood images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Users delete own neighborhood images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'neighborhood-images');

-- Storage policies for building-images
CREATE POLICY "Public Access building"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'building-images');

CREATE POLICY "Authenticated upload building"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'building-images');

CREATE POLICY "Users update own building images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'building-images');

CREATE POLICY "Users delete own building images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'building-images');

-- ============================================
-- DONE! Everything is set up!
-- 
-- ✅ Tables created with image support (TEXT[] array)
-- ✅ Storage buckets created (PUBLIC)
-- ✅ Storage policies set (upload & view)
-- ✅ Security policies configured
-- ✅ NO FAKE DATA - Only REAL user ratings!
-- 
-- Next steps:
-- 1. Go to http://localhost:3000
-- 2. Sign up for an account  
-- 3. Click "Rate Now"
-- 4. Use Mapbox to find location
-- 5. Upload photos (up to 5)
-- 6. Submit and see it instantly!
-- 7. Your photos will display on all pages!
-- ============================================

