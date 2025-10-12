-- ✅ COMPLETE ADMIN SETUP - This will make everything work!

-- Step 1: Add missing columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Step 2: Add missing columns to review tables
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Add missing columns to location tables
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 4: Update RLS policies for full admin access
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON user_profiles;

-- Create admin-friendly policies
CREATE POLICY "Admins have full access to user_profiles" 
ON user_profiles FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  OR auth.uid() = id
);

CREATE POLICY "Admins have full access to neighborhood_reviews" 
ON neighborhood_reviews FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  OR auth.uid() = user_id
);

CREATE POLICY "Admins have full access to building_reviews" 
ON building_reviews FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
  OR auth.uid() = user_id
);

CREATE POLICY "Admins can manage neighborhoods" 
ON neighborhoods FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can manage buildings" 
ON buildings FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Step 5: Ensure your admin user exists
INSERT INTO user_profiles (id, email, is_admin, full_name)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  true,
  'Admin User'
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  email = 'tami76@tiffincrane.com',
  full_name = 'Admin User',
  is_banned = false;

-- Step 6: Verify setup
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_admin = true) as admin_count,
  COUNT(*) FILTER (WHERE is_banned = true) as banned_count
FROM user_profiles
UNION ALL
SELECT 
  'neighborhood_reviews' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count
FROM neighborhood_reviews
UNION ALL
SELECT 
  'building_reviews' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count
FROM building_reviews;

-- ✅ Admin panel is now fully functional!
