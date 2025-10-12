-- ============================================
-- NEIGHBORHOODRANK - COMPLETE DATABASE SETUP
-- Run this ENTIRE file to set up everything
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: Clean Slate - Remove Old Tables
-- ============================================

DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- ============================================
-- STEP 2: Create User Profiles (Admin System)
-- ============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON user_profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STEP 3: Create Location Tables
-- ============================================

CREATE TABLE neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  cover_image TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(name, city, province)
);

CREATE TABLE buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  cover_image TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(address, city)
);

-- ============================================
-- STEP 4: Create Review Tables
-- ============================================

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
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(neighborhood_id, user_id)
);

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
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(building_id, user_id)
);

-- ============================================
-- STEP 5: Auto-Calculate Triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER AS $$
DECLARE
  neighborhood_record RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    neighborhood_record := OLD;
  ELSE
    neighborhood_record := NEW;
  END IF;

  UPDATE neighborhoods
  SET
    average_rating = (
      SELECT COALESCE(AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0), 0)
      FROM neighborhood_reviews
      WHERE neighborhood_id = neighborhood_record.neighborhood_id AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM neighborhood_reviews
      WHERE neighborhood_id = neighborhood_record.neighborhood_id AND status = 'approved'
    ),
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = neighborhood_record.neighborhood_id;

  RETURN neighborhood_record;
END;
$$ LANGUAGE plpgsql;

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
      WHERE building_id = building_record.building_id AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM building_reviews
      WHERE building_id = building_record.building_id AND status = 'approved'
    ),
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = building_record.building_id;

  RETURN building_record;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS neighborhood_review_stats_trigger ON neighborhood_reviews;
CREATE TRIGGER neighborhood_review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
FOR EACH ROW EXECUTE FUNCTION update_neighborhood_stats();

DROP TRIGGER IF EXISTS building_review_stats_trigger ON building_reviews;
CREATE TRIGGER building_review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON building_reviews
FOR EACH ROW EXECUTE FUNCTION update_building_stats();

-- ============================================
-- STEP 6: Create Indexes
-- ============================================

CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug);

CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX idx_buildings_address ON buildings(address);
CREATE INDEX idx_buildings_slug ON buildings(slug);

CREATE INDEX idx_neighborhood_reviews_neighborhood ON neighborhood_reviews(neighborhood_id);
CREATE INDEX idx_neighborhood_reviews_user ON neighborhood_reviews(user_id);
CREATE INDEX idx_neighborhood_reviews_status ON neighborhood_reviews(status);

CREATE INDEX idx_building_reviews_building ON building_reviews(building_id);
CREATE INDEX idx_building_reviews_user ON building_reviews(user_id);
CREATE INDEX idx_building_reviews_status ON building_reviews(status);

CREATE INDEX idx_user_profiles_admin ON user_profiles(is_admin) WHERE is_admin = true;

-- ============================================
-- STEP 7: Enable Row Level Security
-- ============================================

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 8: Create Security Policies
-- ============================================

-- Everyone can view locations
CREATE POLICY "Public view neighborhoods" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public view buildings" ON buildings FOR SELECT USING (true);

-- Authenticated users can insert locations
CREATE POLICY "Auth insert neighborhoods" ON neighborhoods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert buildings" ON buildings FOR INSERT TO authenticated WITH CHECK (true);

-- Admins can update locations (for cover images)
CREATE POLICY "Admins update neighborhoods" ON neighborhoods FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins update buildings" ON buildings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Public can only see approved reviews
CREATE POLICY "Public view approved neighborhood reviews" ON neighborhood_reviews FOR SELECT 
  USING (status = 'approved');

CREATE POLICY "Public view approved building reviews" ON building_reviews FOR SELECT 
  USING (status = 'approved');

-- Users can see their own reviews + Admins see all
CREATE POLICY "Users and admins view neighborhood reviews" ON neighborhood_reviews FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users and admins view building reviews" ON building_reviews FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Authenticated users can insert reviews
CREATE POLICY "Auth insert neighborhood reviews" ON neighborhood_reviews FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth insert building reviews" ON building_reviews FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users update own neighborhood reviews" ON neighborhood_reviews FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own building reviews" ON building_reviews FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Admins can update any review (for approval)
CREATE POLICY "Admins update neighborhood reviews" ON neighborhood_reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins update building reviews" ON building_reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Users can delete their own reviews
CREATE POLICY "Users delete own neighborhood reviews" ON neighborhood_reviews FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own building reviews" ON building_reviews FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 9: Storage Buckets
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

CREATE POLICY "Public read neighborhood images" ON storage.objects FOR SELECT TO public 
  USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Public read building images" ON storage.objects FOR SELECT TO public 
  USING (bucket_id = 'building-images');

CREATE POLICY "Auth upload neighborhood images" ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'neighborhood-images');

CREATE POLICY "Auth upload building images" ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'building-images');

-- ============================================
-- STEP 10: Make YOU Admin
-- ============================================

-- Create profile for your account and set as admin
INSERT INTO user_profiles (id, email, is_admin)
SELECT id, email, true 
FROM auth.users 
WHERE email = 'tami76@tiffincrane.com'
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;

-- ============================================
-- ✅ VERIFICATION
-- ============================================

SELECT 
  email, 
  is_admin,
  created_at,
  CASE 
    WHEN is_admin THEN '🎉 YOU ARE ADMIN! Access /admin now!' 
    ELSE '⚠️ Not admin - check email' 
  END as status
FROM user_profiles 
WHERE email = 'tami76@tiffincrane.com';

-- ============================================
-- ✅ COMPLETE! Your NeighborhoodRank is ready!
-- 
-- What you have:
-- ✓ Multi-user review system
-- ✓ Neighborhoods & buildings tables
-- ✓ Review approval workflow (pending/approved/rejected)
-- ✓ Anonymous posting option
-- ✓ Cover image support
-- ✓ SEO-friendly slugs
-- ✓ Admin panel access for tami76@tiffincrane.com
-- ✓ Secure RLS policies
-- ✓ Auto-calculating ratings
-- ✓ Storage buckets
-- 
-- Next steps:
-- 1. Refresh http://localhost:3001
-- 2. Login with tami76@tiffincrane.com
-- 3. You'll see "Admin Panel" in Account dropdown
-- 4. Access full admin dashboard
-- 5. Approve reviews
-- 6. Upload cover images
-- 7. Manage users
-- 
-- Perfect! 🚀
-- ============================================

