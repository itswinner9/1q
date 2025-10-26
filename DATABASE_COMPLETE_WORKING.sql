-- ═══════════════════════════════════════════════════════════════════════════
-- 🚀 COMPLETE WORKING DATABASE SETUP
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this ONE TIME in Supabase SQL Editor
-- This will:
--   ✅ Drop all existing tables (clean slate)
--   ✅ Create all tables with proper constraints
--   ✅ Prevent duplicate email registrations
--   ✅ Auto-create user profiles
--   ✅ Set up admin system
--   ✅ Create review system with auto-approval
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Clean Slate - Drop Everything
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auto_approve_review() CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Create User Profiles Table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,  -- UNIQUE prevents duplicate emails!
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Enable Row Level Security (but make it permissive)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow system to insert new profiles
CREATE POLICY "System can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Auto-Create User Profile Trigger
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, is_admin, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    FALSE,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicates if trigger runs twice
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: Create Neighborhoods Table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  cover_image TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city, province)
);

CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read neighborhoods"
  ON neighborhoods FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create neighborhoods"
  ON neighborhoods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: Create Buildings Table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  cover_image TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(address, city)
);

CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_slug ON buildings(slug);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read buildings"
  ON buildings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create buildings"
  ON buildings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 6: Create Neighborhood Reviews Table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE neighborhood_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
  transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

CREATE INDEX idx_neighborhood_reviews_status ON neighborhood_reviews(status);
CREATE INDEX idx_neighborhood_reviews_user ON neighborhood_reviews(user_id);

ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved neighborhood reviews"
  ON neighborhood_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can read own neighborhood reviews"
  ON neighborhood_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create neighborhood reviews"
  ON neighborhood_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all neighborhood reviews"
  ON neighborhood_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update neighborhood reviews"
  ON neighborhood_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 7: Create Building Reviews Table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE building_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, user_id)
);

CREATE INDEX idx_building_reviews_status ON building_reviews(status);
CREATE INDEX idx_building_reviews_user ON building_reviews(user_id);

ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved building reviews"
  ON building_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can read own building reviews"
  ON building_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create building reviews"
  ON building_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all building reviews"
  ON building_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update building reviews"
  ON building_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 8: Auto-Approve Reviews (3+ stars = approved, <=2 stars = pending)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_approve_review()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  -- Calculate average rating based on review type
  IF TG_TABLE_NAME = 'neighborhood_reviews' THEN
    avg_rating := (NEW.safety + NEW.cleanliness + NEW.noise + NEW.community + NEW.transit + NEW.amenities) / 6.0;
  ELSIF TG_TABLE_NAME = 'building_reviews' THEN
    avg_rating := (NEW.management + NEW.cleanliness + NEW.maintenance + NEW.rent_value + NEW.noise + NEW.amenities) / 6.0;
  END IF;

  -- Auto-approve if 3+ stars, otherwise set to pending
  IF avg_rating >= 3.0 THEN
    NEW.status := 'approved';
  ELSE
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to both review tables
DROP TRIGGER IF EXISTS auto_approve_neighborhood_review ON neighborhood_reviews;
CREATE TRIGGER auto_approve_neighborhood_review
  BEFORE INSERT ON neighborhood_reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_review();

DROP TRIGGER IF EXISTS auto_approve_building_review ON building_reviews;
CREATE TRIGGER auto_approve_building_review
  BEFORE INSERT ON building_reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_review();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 9: Sync Existing Users to user_profiles
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO user_profiles (id, email, full_name, is_admin, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  FALSE,
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 10: Set Your Account as Admin
-- ═══════════════════════════════════════════════════════════════════════════
-- IMPORTANT: Replace 'your-email@example.com' with YOUR actual email!

UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'zwllhdacxzaqtg@raleigh-construction.com';

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 11: Verify Setup
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  user_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  SELECT COUNT(*) INTO admin_count FROM user_profiles WHERE is_admin = true;
  
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistics:';
  RAISE NOTICE '   Total Users: %', user_count;
  RAISE NOTICE '   Admin Users: %', admin_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables Created:';
  RAISE NOTICE '   • user_profiles (with UNIQUE email constraint)';
  RAISE NOTICE '   • neighborhoods';
  RAISE NOTICE '   • buildings';
  RAISE NOTICE '   • neighborhood_reviews';
  RAISE NOTICE '   • building_reviews';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Features Enabled:';
  RAISE NOTICE '   • Auto-create user profiles on signup';
  RAISE NOTICE '   • Prevent duplicate email registrations';
  RAISE NOTICE '   • Auto-approve good reviews (3+ stars)';
  RAISE NOTICE '   • Pending review for bad reviews (<=2 stars)';
  RAISE NOTICE '   • Admin system';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Go to http://localhost:3000';
  RAISE NOTICE '   2. Try signing up with a new email';
  RAISE NOTICE '   3. Login with your account';
  RAISE NOTICE '   4. Access admin panel at /admin';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;

COMMIT;

