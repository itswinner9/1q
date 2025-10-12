-- ============================================
-- MULTI-USER REVIEW SYSTEM
-- Tracks each user's review separately
-- Shows all comments from all users
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Step 1: Clean slate
-- ============================================

DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- ============================================
-- Step 2: Create location tables (ONE per location)
-- ============================================

-- Neighborhoods table - stores unique locations
CREATE TABLE neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(name, city, province)
);

-- Buildings table - stores unique locations
CREATE TABLE buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(address, city)
);

-- ============================================
-- Step 3: Create review tables (MULTIPLE per location)
-- ============================================

-- Neighborhood reviews - each user's individual review
CREATE TABLE neighborhood_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
  transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(neighborhood_id, user_id)
);

-- Building reviews - each user's individual review
CREATE TABLE building_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(building_id, user_id)
);

-- ============================================
-- Step 4: Auto-calculate averages with triggers
-- ============================================

-- Function to update neighborhood stats
CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER AS $$
DECLARE
  neighborhood_record RECORD;
BEGIN
  -- Get the neighborhood_id (works for INSERT, UPDATE, DELETE)
  IF TG_OP = 'DELETE' THEN
    neighborhood_record := OLD;
  ELSE
    neighborhood_record := NEW;
  END IF;

  -- Calculate and update average rating and total reviews
  UPDATE neighborhoods
  SET
    average_rating = (
      SELECT COALESCE(AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0), 0)
      FROM neighborhood_reviews
      WHERE neighborhood_id = neighborhood_record.neighborhood_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM neighborhood_reviews
      WHERE neighborhood_id = neighborhood_record.neighborhood_id
    ),
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = neighborhood_record.neighborhood_id;

  RETURN neighborhood_record;
END;
$$ LANGUAGE plpgsql;

-- Function to update building stats
CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER AS $$
DECLARE
  building_record RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    building_record := OLD;
  ELSE
    building_record := NEW;
  END IF;

  UPDATE buildings
  SET
    average_rating = (
      SELECT COALESCE(AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0), 0)
      FROM building_reviews
      WHERE building_id = building_record.building_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM building_reviews
      WHERE building_id = building_record.building_id
    ),
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = building_record.building_id;

  RETURN building_record;
END;
$$ LANGUAGE plpgsql;

-- Triggers for neighborhood reviews
CREATE TRIGGER neighborhood_review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
FOR EACH ROW EXECUTE FUNCTION update_neighborhood_stats();

-- Triggers for building reviews
CREATE TRIGGER building_review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON building_reviews
FOR EACH ROW EXECUTE FUNCTION update_building_stats();

-- ============================================
-- Step 5: Create indexes
-- ============================================

CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX idx_neighborhoods_name ON neighborhoods(name);

CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX idx_buildings_address ON buildings(address);

CREATE INDEX idx_neighborhood_reviews_neighborhood ON neighborhood_reviews(neighborhood_id);
CREATE INDEX idx_neighborhood_reviews_user ON neighborhood_reviews(user_id);

CREATE INDEX idx_building_reviews_building ON building_reviews(building_id);
CREATE INDEX idx_building_reviews_user ON building_reviews(user_id);

-- ============================================
-- Step 6: Enable Row Level Security
-- ============================================

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 7: Create policies
-- ============================================

-- Everyone can view locations
CREATE POLICY "Public view neighborhoods" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public view buildings" ON buildings FOR SELECT USING (true);

-- Authenticated users can insert locations
CREATE POLICY "Auth insert neighborhoods" ON neighborhoods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert buildings" ON buildings FOR INSERT TO authenticated WITH CHECK (true);

-- Everyone can view reviews
CREATE POLICY "Public view neighborhood reviews" ON neighborhood_reviews FOR SELECT USING (true);
CREATE POLICY "Public view building reviews" ON building_reviews FOR SELECT USING (true);

-- Authenticated users can insert reviews
CREATE POLICY "Auth insert neighborhood reviews" ON neighborhood_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert building reviews" ON building_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users update own neighborhood reviews" ON neighborhood_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own building reviews" ON building_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users delete own neighborhood reviews" ON neighborhood_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own building reviews" ON building_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- Step 8: Storage buckets
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('neighborhood-images', 'neighborhood-images', true),
  ('building-images', 'building-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Public read building images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload neighborhood images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload building images" ON storage.objects;

CREATE POLICY "Public read neighborhood images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'neighborhood-images');
CREATE POLICY "Public read building images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'building-images');
CREATE POLICY "Auth upload neighborhood images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'neighborhood-images');
CREATE POLICY "Auth upload building images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'building-images');

-- ============================================
-- ✅ DONE! Multi-user review system ready!
-- 
-- HOW IT WORKS:
-- 
-- User A rates "King George, Surrey":
--   1. Creates neighborhoods record (if doesn't exist)
--   2. Creates neighborhood_reviews record for User A
--   3. Trigger auto-calculates: average = 4.5, total = 1
-- 
-- User B rates "King George, Surrey":
--   1. Uses existing neighborhoods record
--   2. Creates neighborhood_reviews record for User B
--   3. Trigger auto-calculates: average = 4.2, total = 2
-- 
-- Result:
--   • ONE "King George" card
--   • Shows average: 4.2
--   • Shows total: 2 Reviews
--   • Detail page shows BOTH user's comments
--   • All photos from both users
-- 
-- Perfect for Yelp-style reviews!
-- ============================================

