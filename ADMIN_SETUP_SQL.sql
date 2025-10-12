-- ============================================
-- ADMIN PANEL SETUP
-- Secure admin system with approval workflow
-- ============================================

-- Step 1: Add admin role to users
-- ============================================

-- Create profiles table to store user roles
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

-- Drop old policies if exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 2: Add approval status to reviews
-- ============================================

ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Add cover image to locations
-- ============================================

ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Step 4: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_status ON neighborhood_reviews(status);
CREATE INDEX IF NOT EXISTS idx_building_reviews_status ON building_reviews(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin ON user_profiles(is_admin) WHERE is_admin = true;

-- Step 5: Set your email as admin
-- ============================================
-- IMPORTANT: Replace 'your-email@example.com' with your actual email!

UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'tami76@tiffincrane.com';

-- If profile doesn't exist yet, you can manually insert:
-- INSERT INTO user_profiles (id, email, is_admin)
-- SELECT id, email, true FROM auth.users WHERE email = 'your-email@example.com';

-- Step 6: Update public visibility policies
-- ============================================

-- Only show approved reviews to public
DROP POLICY IF EXISTS "Public view neighborhood reviews" ON neighborhood_reviews;
CREATE POLICY "Public view neighborhood reviews" 
  ON neighborhood_reviews FOR SELECT 
  USING (status = 'approved');

DROP POLICY IF EXISTS "Public view building reviews" ON building_reviews;
CREATE POLICY "Public view building reviews" 
  ON building_reviews FOR SELECT 
  USING (status = 'approved');

-- Drop old admin policies if exist
DROP POLICY IF EXISTS "Admins view all neighborhood reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Admins view all building reviews" ON building_reviews;
DROP POLICY IF EXISTS "Admins update neighborhood reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Admins update building reviews" ON building_reviews;
DROP POLICY IF EXISTS "Admins update neighborhood cover" ON neighborhoods;
DROP POLICY IF EXISTS "Admins update building cover" ON buildings;

-- Admins can see all reviews
CREATE POLICY "Admins view all neighborhood reviews" 
  ON neighborhood_reviews FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins view all building reviews" 
  ON building_reviews FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Admins can update any review
CREATE POLICY "Admins update neighborhood reviews" 
  ON neighborhood_reviews FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins update building reviews" 
  ON building_reviews FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Admins can update location cover images
CREATE POLICY "Admins update neighborhood cover" 
  ON neighborhoods FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins update building cover" 
  ON buildings FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- ============================================
-- ✅ DONE! Admin system ready!
-- 
-- Admin Features:
-- ✓ Admin role system
-- ✓ Review approval workflow (pending/approved/rejected)
-- ✓ Cover image editing
-- ✓ Secure RLS policies
-- ✓ Only approved reviews show to public
-- 
-- Next: Build admin dashboard at /admin
-- ============================================

