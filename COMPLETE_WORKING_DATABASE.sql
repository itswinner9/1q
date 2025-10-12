-- ✅ COMPLETE WORKING DATABASE SETUP
-- This creates everything from scratch and ensures it all works

-- ========================================
-- STEP 1: CLEAN SLATE - Remove everything
-- ========================================

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ========================================
-- STEP 2: CREATE ALL TABLES FROM SCRATCH
-- ========================================

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Neighborhoods table
CREATE TABLE neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  slug TEXT UNIQUE,
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Buildings table
CREATE TABLE buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  slug TEXT UNIQUE,
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Neighborhood reviews table
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(neighborhood_id, user_id)
);

-- Building reviews table
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(building_id, user_id)
);

-- ========================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX idx_buildings_slug ON buildings(slug);
CREATE INDEX idx_neighborhood_reviews_neighborhood_id ON neighborhood_reviews(neighborhood_id);
CREATE INDEX idx_neighborhood_reviews_user_id ON neighborhood_reviews(user_id);
CREATE INDEX idx_neighborhood_reviews_status ON neighborhood_reviews(status);
CREATE INDEX idx_building_reviews_building_id ON building_reviews(building_id);
CREATE INDEX idx_building_reviews_user_id ON building_reviews(user_id);
CREATE INDEX idx_building_reviews_status ON building_reviews(status);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ========================================
-- STEP 4: CREATE FUNCTIONS FOR AUTO-CALCULATION
-- ========================================

-- Function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, city TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN LOWER(REPLACE(REGEXP_REPLACE(name || '-' || city, '[^a-zA-Z0-9\s-]', '', 'g'), ' ', '-'));
END;
$$;

-- Function to update neighborhood stats
CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Recalculate average rating and total reviews for the neighborhood
  UPDATE neighborhoods 
  SET 
    average_rating = (
      SELECT COALESCE(AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0), 0.0)
      FROM neighborhood_reviews 
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
      AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM neighborhood_reviews 
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
      AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update building stats
CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Recalculate average rating and total reviews for the building
  UPDATE buildings 
  SET 
    average_rating = (
      SELECT COALESCE(AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0), 0.0)
      FROM building_reviews 
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
      AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM building_reviews 
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
      AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    false,
    false
  );
  RETURN NEW;
END;
$$;

-- ========================================
-- STEP 5: CREATE TRIGGERS
-- ========================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers for auto-updating stats
DROP TRIGGER IF EXISTS neighborhood_review_stats_trigger ON neighborhood_reviews;
CREATE TRIGGER neighborhood_review_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION update_neighborhood_stats();

DROP TRIGGER IF EXISTS building_review_stats_trigger ON building_reviews;
CREATE TRIGGER building_review_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION update_building_stats();

-- ========================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 7: CREATE SECURITY POLICIES
-- ========================================

-- User profiles policies
CREATE POLICY "Users can manage own profile" 
ON user_profiles FOR ALL 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
ON user_profiles FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Neighborhoods policies
CREATE POLICY "Anyone can read neighborhoods" 
ON neighborhoods FOR SELECT 
TO public
USING (true);

CREATE POLICY "Authenticated users can insert neighborhoods" 
ON neighborhoods FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage neighborhoods" 
ON neighborhoods FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Buildings policies
CREATE POLICY "Anyone can read buildings" 
ON buildings FOR SELECT 
TO public
USING (true);

CREATE POLICY "Authenticated users can insert buildings" 
ON buildings FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage buildings" 
ON buildings FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Neighborhood reviews policies
CREATE POLICY "Anyone can read approved neighborhood reviews" 
ON neighborhood_reviews FOR SELECT 
TO public
USING (status = 'approved');

CREATE POLICY "Users can manage own neighborhood reviews" 
ON neighborhood_reviews FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all neighborhood reviews" 
ON neighborhood_reviews FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Building reviews policies
CREATE POLICY "Anyone can read approved building reviews" 
ON building_reviews FOR SELECT 
TO public
USING (status = 'approved');

CREATE POLICY "Users can manage own building reviews" 
ON building_reviews FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all building reviews" 
ON building_reviews FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ========================================
-- STEP 8: INSERT ADMIN USER
-- ========================================

INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  'Admin User',
  true,
  false
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  email = 'tami76@tiffincrane.com',
  full_name = 'Admin User',
  is_banned = false;

-- ========================================
-- STEP 9: VERIFY SETUP
-- ========================================

-- Show table counts
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'neighborhoods' as table_name, COUNT(*) as record_count FROM neighborhoods
UNION ALL
SELECT 'buildings' as table_name, COUNT(*) as record_count FROM buildings
UNION ALL
SELECT 'neighborhood_reviews' as table_name, COUNT(*) as record_count FROM neighborhood_reviews
UNION ALL
SELECT 'building_reviews' as table_name, COUNT(*) as record_count FROM building_reviews;

-- Verify admin user
SELECT id, email, is_admin, is_banned, full_name 
FROM user_profiles 
WHERE email = 'tami76@tiffincrane.com';

-- ✅ COMPLETE DATABASE SETUP FINISHED!
