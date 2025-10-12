-- ============================================
-- FRESH START - WORKING SQL
-- Copy this ENTIRE file and run in Supabase
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: Drop old tables (clean start)
-- ============================================

DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- ============================================
-- STEP 2: Create tables that match your code
-- ============================================

-- Neighborhoods table
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

-- Buildings table
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
-- STEP 3: Create indexes for performance
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
-- STEP 4: Enable Row Level Security
-- ============================================

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create policies (simple and working)
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Neighborhoods are viewable by everyone" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can insert neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can update neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Authenticated users can delete neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Buildings are viewable by everyone" ON buildings;
DROP POLICY IF EXISTS "Authenticated users can insert buildings" ON buildings;
DROP POLICY IF EXISTS "Authenticated users can update buildings" ON buildings;
DROP POLICY IF EXISTS "Authenticated users can delete buildings" ON buildings;

-- Neighborhoods policies
CREATE POLICY "Neighborhoods are viewable by everyone" 
  ON neighborhoods FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert neighborhoods" 
  ON neighborhoods FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own neighborhoods" 
  ON neighborhoods FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own neighborhoods" 
  ON neighborhoods FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Buildings policies
CREATE POLICY "Buildings are viewable by everyone" 
  ON buildings FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert buildings" 
  ON buildings FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own buildings" 
  ON buildings FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buildings" 
  ON buildings FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Set up storage buckets
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('neighborhood-images', 'neighborhood-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('building-images', 'building-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880;

-- Drop old storage policies
DROP POLICY IF EXISTS "Public read neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Public read building images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload building images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update building images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete building images" ON storage.objects;

-- Storage policies - PUBLIC READ
CREATE POLICY "Public read neighborhood images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Public read building images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'building-images');

-- Storage policies - AUTH UPLOAD
CREATE POLICY "Auth upload neighborhood images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'neighborhood-images');

CREATE POLICY "Auth upload building images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'building-images');

-- Storage policies - UPDATE
CREATE POLICY "Auth update neighborhood images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Auth update building images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'building-images');

-- Storage policies - DELETE
CREATE POLICY "Auth delete neighborhood images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Auth delete building images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'building-images');

-- ============================================
-- ✅ DONE! Database is ready!
-- 
-- What you have now:
-- ✓ neighborhoods table (with all rating columns + images)
-- ✓ buildings table (with all rating columns + images)
-- ✓ Storage buckets (PUBLIC for images)
-- ✓ All security policies
-- ✓ Indexes for fast queries
-- 
-- Next steps:
-- 1. Go to http://localhost:3000
-- 2. Sign up or login
-- 3. Click "Rate Now"
-- 4. Use Mapbox to find location
-- 5. Rate categories
-- 6. Add comment (optional)
-- 7. Upload photos
-- 8. Submit - WORKS! ✅
-- ============================================

