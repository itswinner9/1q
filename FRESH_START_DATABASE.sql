-- ✅ FRESH START - COMPLETE WORKING DATABASE
-- This creates everything from scratch with minimal complexity

-- ========================================
-- STEP 1: CLEAN EVERYTHING
-- ========================================

-- Drop everything in correct order
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_neighborhood_stats() CASCADE;
DROP FUNCTION IF EXISTS update_building_stats() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS generate_slug(TEXT, TEXT) CASCADE;

-- ========================================
-- STEP 2: CREATE SIMPLE TABLES
-- ========================================

-- User profiles - simple and working
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neighborhoods - simple structure
CREATE TABLE neighborhoods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  slug TEXT,
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings - simple structure
CREATE TABLE buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  slug TEXT,
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neighborhood reviews - simple and working
CREATE TABLE neighborhood_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  display_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

-- Building reviews - simple and working
CREATE TABLE building_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  display_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, user_id)
);

-- ========================================
-- STEP 3: ENABLE RLS
-- ========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: CREATE SIMPLE POLICIES
-- ========================================

-- User profiles policies
CREATE POLICY "Enable all for user_profiles" 
ON user_profiles FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Neighborhoods policies
CREATE POLICY "Enable read for neighborhoods" 
ON neighborhoods FOR SELECT 
TO public
USING (true);

CREATE POLICY "Enable all for authenticated neighborhoods" 
ON neighborhoods FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Buildings policies
CREATE POLICY "Enable read for buildings" 
ON buildings FOR SELECT 
TO public
USING (true);

CREATE POLICY "Enable all for authenticated buildings" 
ON buildings FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Neighborhood reviews policies
CREATE POLICY "Enable all for neighborhood_reviews" 
ON neighborhood_reviews FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Building reviews policies
CREATE POLICY "Enable all for building_reviews" 
ON building_reviews FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- ========================================
-- STEP 5: CREATE ADMIN USER
-- ========================================

INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  'Admin User',
  true,
  false
);

-- ========================================
-- STEP 6: VERIFY SETUP
-- ========================================

-- Show that everything was created
SELECT 'Tables created successfully' as status;

-- Show admin user
SELECT id, email, is_admin, is_banned, full_name 
FROM user_profiles 
WHERE email = 'tami76@tiffincrane.com';

-- Show table counts
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'neighborhoods' as table_name, COUNT(*) as count FROM neighborhoods
UNION ALL
SELECT 'buildings' as table_name, COUNT(*) as count FROM buildings
UNION ALL
SELECT 'neighborhood_reviews' as table_name, COUNT(*) as count FROM neighborhood_reviews
UNION ALL
SELECT 'building_reviews' as table_name, COUNT(*) as count FROM building_reviews;

-- ✅ FRESH START COMPLETE!
