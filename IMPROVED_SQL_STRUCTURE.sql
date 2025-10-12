-- ============================================
-- IMPROVED DATABASE STRUCTURE
-- Multiple users can rate the same location
-- Ratings are aggregated like Yelp/TripAdvisor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Step 1: Create LOCATIONS tables (unique places)
-- ============================================

-- Neighborhoods (unique locations)
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_ratings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(name, city, province)
);

-- Buildings (unique locations)
CREATE TABLE IF NOT EXISTS buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_ratings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(address, city)
);

-- ============================================
-- Step 2: Create REVIEWS tables (individual ratings)
-- ============================================

-- Neighborhood reviews (one per user per neighborhood)
CREATE TABLE IF NOT EXISTS neighborhood_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
  transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(neighborhood_id, user_id)
);

-- Building reviews (one per user per building)
CREATE TABLE IF NOT EXISTS building_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(building_id, user_id)
);

-- ============================================
-- Step 3: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);
CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_neighborhood ON neighborhood_reviews(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_user ON neighborhood_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_building_reviews_building ON building_reviews(building_id);
CREATE INDEX IF NOT EXISTS idx_building_reviews_user ON building_reviews(user_id);

-- ============================================
-- Step 4: Create function to update average ratings
-- ============================================

-- Function to recalculate neighborhood average rating
CREATE OR REPLACE FUNCTION update_neighborhood_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE neighborhoods
  SET 
    average_rating = (
      SELECT ROUND(AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0), 2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate building average rating
CREATE OR REPLACE FUNCTION update_building_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buildings
  SET 
    average_rating = (
      SELECT ROUND(AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0), 2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 5: Create triggers
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_neighborhood_rating ON neighborhood_reviews;
CREATE TRIGGER trigger_update_neighborhood_rating
AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
FOR EACH ROW
EXECUTE FUNCTION update_neighborhood_rating();

DROP TRIGGER IF EXISTS trigger_update_building_rating ON building_reviews;
CREATE TRIGGER trigger_update_building_rating
AFTER INSERT OR UPDATE OR DELETE ON building_reviews
FOR EACH ROW
EXECUTE FUNCTION update_building_rating();

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

-- Locations are viewable by everyone
DROP POLICY IF EXISTS "Neighborhoods viewable" ON neighborhoods;
CREATE POLICY "Neighborhoods viewable" ON neighborhoods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Buildings viewable" ON buildings;
CREATE POLICY "Buildings viewable" ON buildings FOR SELECT USING (true);

-- Reviews are viewable by everyone
DROP POLICY IF EXISTS "Neighborhood reviews viewable" ON neighborhood_reviews;
CREATE POLICY "Neighborhood reviews viewable" ON neighborhood_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Building reviews viewable" ON building_reviews;
CREATE POLICY "Building reviews viewable" ON building_reviews FOR SELECT USING (true);

-- Users can insert their own reviews
DROP POLICY IF EXISTS "Users insert neighborhood reviews" ON neighborhood_reviews;
CREATE POLICY "Users insert neighborhood reviews" 
  ON neighborhood_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert building reviews" ON building_reviews;
CREATE POLICY "Users insert building reviews" 
  ON building_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users update own neighborhood reviews" ON neighborhood_reviews;
CREATE POLICY "Users update own neighborhood reviews" 
  ON neighborhood_reviews FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own building reviews" ON building_reviews;
CREATE POLICY "Users update own building reviews" 
  ON building_reviews FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users delete own neighborhood reviews" ON neighborhood_reviews;
CREATE POLICY "Users delete own neighborhood reviews" 
  ON neighborhood_reviews FOR DELETE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own building reviews" ON building_reviews;
CREATE POLICY "Users delete own building reviews" 
  ON building_reviews FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- Step 8: Set Up Storage Buckets and Policies
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('neighborhood-images', 'neighborhood-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('building-images', 'building-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Storage policies
DROP POLICY IF EXISTS "Public read neighborhood" ON storage.objects;
CREATE POLICY "Public read neighborhood"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'neighborhood-images');

DROP POLICY IF EXISTS "Public read building" ON storage.objects;
CREATE POLICY "Public read building"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'building-images');

DROP POLICY IF EXISTS "Auth upload neighborhood" ON storage.objects;
CREATE POLICY "Auth upload neighborhood"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'neighborhood-images');

DROP POLICY IF EXISTS "Auth upload building" ON storage.objects;
CREATE POLICY "Auth upload building"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'building-images');

DROP POLICY IF EXISTS "Auth update neighborhood" ON storage.objects;
CREATE POLICY "Auth update neighborhood"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'neighborhood-images');

DROP POLICY IF EXISTS "Auth update building" ON storage.objects;
CREATE POLICY "Auth update building"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'building-images');

DROP POLICY IF EXISTS "Auth delete neighborhood" ON storage.objects;
CREATE POLICY "Auth delete neighborhood"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'neighborhood-images');

DROP POLICY IF EXISTS "Auth delete building" ON storage.objects;
CREATE POLICY "Auth delete building"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'building-images');

-- ============================================
-- DONE! Improved Structure Complete!
-- 
-- ✅ Neighborhoods table (unique locations)
-- ✅ Buildings table (unique locations)
-- ✅ Neighborhood reviews (multiple users per location)
-- ✅ Building reviews (multiple users per location)
-- ✅ Automatic rating aggregation
-- ✅ Storage buckets configured
-- ✅ All policies set
-- 
-- How it works:
-- 1. User rates "Liberty Village, Toronto"
-- 2. System checks if location exists
-- 3. If YES → Adds review, updates average
-- 4. If NO → Creates location, adds review
-- 5. Average rating auto-calculates
-- 6. Shows aggregated rating on cards
-- 7. Can view all individual reviews!
-- ============================================
