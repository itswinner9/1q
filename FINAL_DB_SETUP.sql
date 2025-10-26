-- ═══════════════════════════════════════════════════════════════
-- FINAL DATABASE SETUP FOR NEW SUPABASE PROJECT
-- ═══════════════════════════════════════════════════════════════
-- Copy ALL of this and paste in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Drop everything first
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 2: Create user_profiles (NO RLS!)
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

-- NO RLS = Anyone can access (simpler for now)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Auto-create profile trigger
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

-- Step 4: Sync existing users (if any)
INSERT INTO user_profiles (id, email, full_name, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Step 5: Create neighborhoods table
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
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city, province)
);

ALTER TABLE neighborhoods DISABLE ROW LEVEL SECURITY;

-- Step 6: Create buildings table
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
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(address, city)
);

ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;

-- Step 7: Create neighborhood reviews
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
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

ALTER TABLE neighborhood_reviews DISABLE ROW LEVEL SECURITY;

-- Step 8: Create building reviews
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
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, user_id)
);

ALTER TABLE building_reviews DISABLE ROW LEVEL SECURITY;

-- Step 10: Set admin email
-- Make this user an admin (they need to sign up first)
-- If user doesn't exist yet, this will just be skipped
UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'ophelia7067@tiffincrane.com';

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created successfully!';
  RAISE NOTICE '✅ Auto-profile trigger enabled';
  RAISE NOTICE '✅ Duplicate email prevention enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Now you can:';
  RAISE NOTICE '1. Go to /signup to create an account';
  RAISE NOTICE '2. Go to /login to sign in';
  RAISE NOTICE '3. After signup, set is_admin=true in user_profiles';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

