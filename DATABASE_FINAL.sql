-- ═══════════════════════════════════════════════════════════════
-- 🗄️ NEIGHBORHOODRANK - COMPLETE DATABASE SETUP
-- ═══════════════════════════════════════════════════════════════
-- Run this ENTIRE file ONCE in Supabase SQL Editor
-- This is the ONLY SQL file you need
-- ═══════════════════════════════════════════════════════════════

-- ============================================
-- CLEAN SLATE: Drop Everything
-- ============================================
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_neighborhood_stats() CASCADE;
DROP FUNCTION IF EXISTS update_building_stats() CASCADE;
DROP FUNCTION IF EXISTS auto_approve_review() CASCADE;

-- ============================================
-- TABLE 1: user_profiles
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- No RLS - keep it simple
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_admin ON user_profiles(is_admin) WHERE is_admin = true;

-- ============================================
-- TABLE 2: neighborhoods
-- ============================================
CREATE TABLE neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT,
  cover_image TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, city, province)
);

ALTER TABLE neighborhoods DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);

-- ============================================
-- TABLE 3: buildings
-- ============================================
CREATE TABLE buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT,
  cover_image TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, address, city)
);

ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_buildings_slug ON buildings(slug);
CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);

-- ============================================
-- TABLE 4: neighborhood_reviews
-- ============================================
CREATE TABLE neighborhood_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  safety INTEGER CHECK (safety >= 1 AND safety <= 5) NOT NULL,
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5) NOT NULL,
  noise INTEGER CHECK (noise >= 1 AND noise <= 5) NOT NULL,
  community INTEGER CHECK (community >= 1 AND community <= 5) NOT NULL,
  transit INTEGER CHECK (transit >= 1 AND transit <= 5) NOT NULL,
  amenities INTEGER CHECK (amenities >= 1 AND amenities <= 5) NOT NULL,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  display_name TEXT,
  status TEXT DEFAULT 'approved',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

ALTER TABLE neighborhood_reviews DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_nr_neighborhood ON neighborhood_reviews(neighborhood_id);
CREATE INDEX idx_nr_user ON neighborhood_reviews(user_id);
CREATE INDEX idx_nr_status ON neighborhood_reviews(status);

-- ============================================
-- TABLE 5: building_reviews
-- ============================================
CREATE TABLE building_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  management INTEGER CHECK (management >= 1 AND management <= 5) NOT NULL,
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5) NOT NULL,
  maintenance INTEGER CHECK (maintenance >= 1 AND maintenance <= 5) NOT NULL,
  rent_value INTEGER CHECK (rent_value >= 1 AND rent_value <= 5) NOT NULL,
  noise INTEGER CHECK (noise >= 1 AND noise <= 5) NOT NULL,
  amenities INTEGER CHECK (amenities >= 1 AND amenities <= 5) NOT NULL,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  display_name TEXT,
  status TEXT DEFAULT 'approved',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, user_id)
);

ALTER TABLE building_reviews DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_br_building ON building_reviews(building_id);
CREATE INDEX idx_br_user ON building_reviews(user_id);
CREATE INDEX idx_br_status ON building_reviews(status);

-- ============================================
-- FUNCTION: Auto-create user profiles
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    false,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails, don't block signup
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- FUNCTION: Auto-approve good ratings (3+)
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_review()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  -- Calculate average for the review
  IF TG_TABLE_NAME = 'neighborhood_reviews' THEN
    avg_rating := (NEW.safety + NEW.cleanliness + NEW.noise + NEW.community + NEW.transit + NEW.amenities) / 6.0;
  ELSE
    avg_rating := (NEW.management + NEW.cleanliness + NEW.maintenance + NEW.rent_value + NEW.noise + NEW.amenities) / 6.0;
  END IF;

  -- Auto-approve if 3+ stars, else pending
  IF avg_rating >= 3.0 THEN
    NEW.status := 'approved';
    NEW.approved_at := NOW();
    NEW.approved_by := NEW.user_id;
  ELSE
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_approve_neighborhood_review
  BEFORE INSERT OR UPDATE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION auto_approve_review();

CREATE TRIGGER auto_approve_building_review
  BEFORE INSERT OR UPDATE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION auto_approve_review();

-- ============================================
-- FUNCTION: Update aggregate stats
-- ============================================
CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE neighborhoods
  SET 
    average_rating = COALESCE((
      SELECT ROUND(AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0), 2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
      AND status = 'approved'
    ), 0),
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_neighborhood_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION update_neighborhood_stats();

CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buildings
  SET 
    average_rating = COALESCE((
      SELECT ROUND(AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0), 2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
      AND status = 'approved'
    ), 0),
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_building_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION update_building_stats();

-- ============================================
-- DATA: Sync existing users
-- ============================================
INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', ''),
  false,
  false
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DATA: Set admin users
-- ============================================
UPDATE user_profiles SET is_admin = true 
WHERE email IN ('tami76@tiffincrane.com', 'athenerose@powerscrews.com');

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '═══════════════════════════════════════════════' as line;
SELECT '✅ DATABASE SETUP COMPLETE!' as status;
SELECT '═══════════════════════════════════════════════' as line;

SELECT 'Total Users:' as info, COUNT(*)::text as value FROM user_profiles;
SELECT 'Admin Users:' as info, STRING_AGG(email, ', ') as value FROM user_profiles WHERE is_admin = true;
SELECT 'Neighborhoods:' as info, COUNT(*)::text as value FROM neighborhoods;
SELECT 'Buildings:' as info, COUNT(*)::text as value FROM buildings;
SELECT 'Pending Reviews:' as info, 
  (SELECT COUNT(*) FROM neighborhood_reviews WHERE status = 'pending') + 
  (SELECT COUNT(*) FROM building_reviews WHERE status = 'pending') as value;
SELECT 'Approved Reviews:' as info,
  (SELECT COUNT(*) FROM neighborhood_reviews WHERE status = 'approved') + 
  (SELECT COUNT(*) FROM building_reviews WHERE status = 'approved') as value;

SELECT '═══════════════════════════════════════════════' as line;
SELECT '🎯 Next Steps:' as info;
SELECT '1. Restart your dev server: npm run dev' as step;
SELECT '2. Test login at: http://localhost:3000/login' as step;
SELECT '3. Test admin at: http://localhost:3000/admin' as step;
SELECT '═══════════════════════════════════════════════' as line;

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE! Your database is ready!
-- ═══════════════════════════════════════════════════════════════

