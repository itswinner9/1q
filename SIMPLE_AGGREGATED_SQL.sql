-- ============================================
-- COPY AND RUN THIS ENTIRE SQL IN SUPABASE
-- This creates a system where multiple users can rate the same location
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP OLD TABLES (if they exist)
-- ============================================

DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- ============================================
-- CREATE NEW TABLES
-- ============================================

-- Neighborhoods (unique locations)
CREATE TABLE neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(name, city, province)
);

-- Buildings (unique locations)
CREATE TABLE buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(address, city)
);

-- Neighborhood reviews (multiple users can review same neighborhood)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(neighborhood_id, user_id)
);

-- Building reviews (multiple users can review same building)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(building_id, user_id)
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX idx_buildings_name ON buildings(name);
CREATE INDEX idx_neighborhood_reviews_neighborhood ON neighborhood_reviews(neighborhood_id);
CREATE INDEX idx_neighborhood_reviews_user ON neighborhood_reviews(user_id);
CREATE INDEX idx_building_reviews_building ON building_reviews(building_id);
CREATE INDEX idx_building_reviews_user ON building_reviews(user_id);

-- ============================================
-- CREATE FUNCTIONS TO AUTO-CALCULATE AVERAGES
-- ============================================

-- Function: Update neighborhood average rating
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
    total_reviews = (
      SELECT COUNT(*)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Update building average rating
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
    total_reviews = (
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
-- CREATE TRIGGERS
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
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES
-- ============================================

-- Everyone can view locations
DROP POLICY IF EXISTS "Public view neighborhoods" ON neighborhoods;
CREATE POLICY "Public view neighborhoods" ON neighborhoods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view buildings" ON buildings;
CREATE POLICY "Public view buildings" ON buildings FOR SELECT USING (true);

-- Everyone can view reviews
DROP POLICY IF EXISTS "Public view neighborhood reviews" ON neighborhood_reviews;
CREATE POLICY "Public view neighborhood reviews" ON neighborhood_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view building reviews" ON building_reviews;
CREATE POLICY "Public view building reviews" ON building_reviews FOR SELECT USING (true);

-- Authenticated users can insert reviews
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
-- STORAGE BUCKETS AND POLICIES
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('neighborhood-images', 'neighborhood-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('building-images', 'building-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "Public read neighborhood images" ON storage.objects;
CREATE POLICY "Public read neighborhood images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'neighborhood-images');

DROP POLICY IF EXISTS "Public read building images" ON storage.objects;
CREATE POLICY "Public read building images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'building-images');

DROP POLICY IF EXISTS "Auth upload neighborhood images" ON storage.objects;
CREATE POLICY "Auth upload neighborhood images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'neighborhood-images');

DROP POLICY IF EXISTS "Auth upload building images" ON storage.objects;
CREATE POLICY "Auth upload building images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'building-images');

-- ============================================
-- DONE! 
-- 
-- ✅ 2 users rate same place = 1 card with 2 reviews
-- ✅ Average rating auto-calculated
-- ✅ Review count displayed
-- ✅ All photos collected from all reviews
-- ✅ Comments from all users saved
-- 
-- Example:
-- User A rates "Liberty Village" (5 stars + photo)
-- User B rates "Liberty Village" (4 stars + comment)
-- Result: ONE card showing 4.5 stars (2 Reviews)
-- ============================================
