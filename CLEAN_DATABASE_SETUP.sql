-- ═══════════════════════════════════════════════════════════════
-- 🔧 CLEAN DATABASE SETUP - Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Drop existing tables
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create neighborhoods
CREATE TABLE neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE neighborhoods DISABLE ROW LEVEL SECURITY;

-- Create buildings
CREATE TABLE buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;

-- Create neighborhood_reviews
CREATE TABLE neighborhood_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  safety INTEGER CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER CHECK (noise >= 1 AND noise <= 5),
  community INTEGER CHECK (community >= 1 AND community <= 5),
  transit INTEGER CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE neighborhood_reviews DISABLE ROW LEVEL SECURITY;

-- Create building_reviews
CREATE TABLE building_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  management INTEGER CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE building_reviews DISABLE ROW LEVEL SECURITY;

-- Sync existing users
INSERT INTO user_profiles (id, email, full_name, is_admin)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', ''),
  false
FROM auth.users
ON CONFLICT (email) DO NOTHING;

-- Set admins
UPDATE user_profiles SET is_admin = true WHERE email = 'tami76@tiffincrane.com';
UPDATE user_profiles SET is_admin = true WHERE email = 'athenerose@powerscrews.com';

-- Verify
SELECT '✅ Setup Complete!' as status;
SELECT 'Total users:' as info, COUNT(*) as count FROM user_profiles;
SELECT 'Admin users:' as info, email FROM user_profiles WHERE is_admin = true;

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE! Tables created, admins set, ready to use!
-- ═══════════════════════════════════════════════════════════════
