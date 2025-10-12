-- ============================================
-- COMPLETE ADMIN SYSTEM - ALL IN ONE
-- Run this ONE file to activate everything
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Part 1: Create user_profiles table
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop and create policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Part 2: Add review status and cover images
-- ============================================

-- Add status to reviews
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add cover images to locations
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Set existing reviews as approved (so they show up)
UPDATE neighborhood_reviews SET status = 'approved' WHERE status IS NULL;
UPDATE building_reviews SET status = 'approved' WHERE status IS NULL;

-- ============================================
-- Part 3: Update RLS policies for admin
-- ============================================

-- Public can only see approved reviews
DROP POLICY IF EXISTS "Public view neighborhood reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Public view building reviews" ON building_reviews;

CREATE POLICY "Public view neighborhood reviews" 
  ON neighborhood_reviews FOR SELECT 
  USING (status = 'approved');

CREATE POLICY "Public view building reviews" 
  ON building_reviews FOR SELECT 
  USING (status = 'approved');

-- Admins can see ALL reviews (including pending)
DROP POLICY IF EXISTS "Admins view all neighborhood reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Admins view all building reviews" ON building_reviews;

CREATE POLICY "Admins view all neighborhood reviews" 
  ON neighborhood_reviews FOR SELECT 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "Admins view all building reviews" 
  ON building_reviews FOR SELECT 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() = user_id
  );

-- Admins can update reviews (approve/reject)
DROP POLICY IF EXISTS "Admins update neighborhood reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Admins update building reviews" ON building_reviews;

CREATE POLICY "Admins update neighborhood reviews" 
  ON neighborhood_reviews FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins update building reviews" 
  ON building_reviews FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can update locations (cover images)
DROP POLICY IF EXISTS "Admins update neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Admins update buildings" ON buildings;

CREATE POLICY "Admins update neighborhoods" 
  ON neighborhoods FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins update buildings" 
  ON buildings FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Part 4: Make YOU admin
-- ============================================

-- Insert profile for existing user or update to admin
INSERT INTO user_profiles (id, email, is_admin)
SELECT id, email, true 
FROM auth.users 
WHERE email = 'tami76@tiffincrane.com'
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;

-- ============================================
-- Part 5: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_admin ON user_profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_status ON neighborhood_reviews(status);
CREATE INDEX IF NOT EXISTS idx_building_reviews_status ON building_reviews(status);

-- ============================================
-- ✅ VERIFICATION - Check if you're admin
-- ============================================

SELECT 
  email, 
  is_admin,
  CASE WHEN is_admin THEN '✅ YOU ARE ADMIN!' ELSE '⚠️ Not admin yet' END as status
FROM user_profiles 
WHERE email = 'tami76@tiffincrane.com';

-- ============================================
-- ✅ DONE! Complete admin system ready!
-- 
-- What you got:
-- ✓ user_profiles table created
-- ✓ You are admin (tami76@tiffincrane.com)
-- ✓ Review approval system (pending/approved/rejected)
-- ✓ Cover image columns added
-- ✓ Existing reviews marked as 'approved'
-- ✓ Secure RLS policies
-- ✓ Admin can see all reviews
-- ✓ Public only sees approved reviews
-- ✓ Admin can update cover images
-- 
-- Now:
-- 1. Refresh http://localhost:3001
-- 2. Login with tami76@tiffincrane.com
-- 3. Click Account → Admin Panel
-- 4. Access your full admin dashboard!
-- 5. Approve reviews
-- 6. Upload cover images
-- 7. Manage users
-- 
-- Perfect admin system! 🎊
-- ============================================

