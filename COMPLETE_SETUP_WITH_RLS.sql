-- ═══════════════════════════════════════════════════════════════
-- COMPLETE DATABASE SETUP WITH RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════════════
-- Copy ALL of this and paste in Supabase SQL Editor, then click RUN
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Clean up - Drop all existing tables and policies
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- Step 2: Create user_profiles table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Step 3: Create auto-profile trigger
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Sync existing users
INSERT INTO user_profiles (id, email, full_name, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Step 4: Set admin user
-- ═══════════════════════════════════════════════════════════════
UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'ophelia7067@tiffincrane.com';

-- ═══════════════════════════════════════════════════════════════
-- Step 5: Create neighborhoods table
-- ═══════════════════════════════════════════════════════════════
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
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city, province)
);

-- Enable RLS
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for neighborhoods
CREATE POLICY "Anyone can view neighborhoods"
  ON neighborhoods FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create neighborhoods"
  ON neighborhoods FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update neighborhoods"
  ON neighborhoods FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Step 6: Create buildings table
-- ═══════════════════════════════════════════════════════════════
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
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(address, city)
);

-- Enable RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buildings
CREATE POLICY "Anyone can view buildings"
  ON buildings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create buildings"
  ON buildings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update buildings"
  ON buildings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Step 7: Create neighborhood_reviews table
-- ═══════════════════════════════════════════════════════════════
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

-- Enable RLS
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for neighborhood_reviews
CREATE POLICY "Anyone can view approved reviews"
  ON neighborhood_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own reviews"
  ON neighborhood_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON neighborhood_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Authenticated users can create reviews"
  ON neighborhood_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own reviews"
  ON neighborhood_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all reviews"
  ON neighborhood_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Step 8: Create building_reviews table
-- ═══════════════════════════════════════════════════════════════
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, user_id)
);

-- Enable RLS
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for building_reviews
CREATE POLICY "Anyone can view approved reviews"
  ON building_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own reviews"
  ON building_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON building_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Authenticated users can create reviews"
  ON building_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own reviews"
  ON building_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all reviews"
  ON building_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Step 9: Success message
-- ═══════════════════════════════════════════════════════════════
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE WITH RLS!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ RLS enabled on all tables';
  RAISE NOTICE '✅ Policies configured';
  RAISE NOTICE '✅ Auto-profile trigger active';
  RAISE NOTICE '✅ Admin user set: ophelia7067@tiffincrane.com';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

-- Verify setup
SELECT 
  'user_profiles' as table_name, 
  COUNT(*)::int as rows,
  (SELECT COUNT(*)::int FROM user_profiles WHERE is_admin = true) as admins
FROM user_profiles
UNION ALL
SELECT 
  'neighborhoods' as table_name, 
  COUNT(*)::int as rows,
  0 as admins
FROM neighborhoods
UNION ALL
SELECT 
  'buildings' as table_name, 
  COUNT(*)::int as rows,
  0 as admins
FROM buildings
UNION ALL
SELECT 
  'neighborhood_reviews' as table_name, 
  COUNT(*)::int as rows,
  0 as admins
FROM neighborhood_reviews
UNION ALL
SELECT 
  'building_reviews' as table_name, 
  COUNT(*)::int as rows,
  0 as admins
FROM building_reviews;

