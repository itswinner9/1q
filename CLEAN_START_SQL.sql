-- ============================================
-- CLEAN START - Simple Working Structure
-- Copy and run this ENTIRE file in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Step 1: Clean slate - remove everything
-- ============================================

DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- ============================================
-- Step 2: Create simple working tables
-- ============================================

-- Neighborhoods table (one row per rating)
CREATE TABLE neighborhoods (
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

-- Buildings table (one row per rating)
CREATE TABLE buildings (
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

-- ============================================
-- Step 3: Create indexes
-- ============================================

CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX idx_neighborhoods_user ON neighborhoods(user_id);

CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX idx_buildings_name ON buildings(name);
CREATE INDEX idx_buildings_user ON buildings(user_id);

-- ============================================
-- Step 4: Enable Row Level Security
-- ============================================

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 5: Create simple policies
-- ============================================

-- Everyone can view
CREATE POLICY "Public can view neighborhoods"
  ON neighborhoods FOR SELECT
  USING (true);

CREATE POLICY "Public can view buildings"
  ON buildings FOR SELECT
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Auth users can insert neighborhoods"
  ON neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can insert buildings"
  ON buildings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "Users can update own neighborhoods"
  ON neighborhoods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own buildings"
  ON buildings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users can delete own neighborhoods"
  ON neighborhoods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own buildings"
  ON buildings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- Step 6: Set up storage buckets
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('neighborhood-images', 'neighborhood-images', true),
  ('building-images', 'building-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old storage policies if they exist
DROP POLICY IF EXISTS "Public read neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Public read building images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload building images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public read neighborhood images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Public read building images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'building-images');

CREATE POLICY "Auth upload neighborhood images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'neighborhood-images');

CREATE POLICY "Auth upload building images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'building-images');

-- ============================================
-- ✅ DONE! Your database is ready!
-- 
-- Tables created with:
-- ✓ All rating fields
-- ✓ Image support (TEXT[] array)
-- ✓ User tracking
-- ✓ Security policies
-- ✓ Storage buckets (PUBLIC)
-- 
-- Now test:
-- 1. Go to http://localhost:3000
-- 2. Sign up
-- 3. Rate a neighborhood
-- 4. Upload photos
-- 5. Submit - WORKS!
-- ============================================

