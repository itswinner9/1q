-- ═══════════════════════════════════════════════════════════════
-- FIX ADMIN ACCESS - Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Make sure RLS is disabled on all tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing RLS policies (they might be blocking access)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Public can view neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Users can create neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Admins can update neighborhoods" ON neighborhoods;

DROP POLICY IF EXISTS "Public can view buildings" ON buildings;
DROP POLICY IF EXISTS "Users can create buildings" ON buildings;
DROP POLICY IF EXISTS "Admins can update buildings" ON buildings;

DROP POLICY IF EXISTS "Public can view approved reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON neighborhood_reviews;

DROP POLICY IF EXISTS "Public can view approved reviews" ON building_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON building_reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON building_reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON building_reviews;

-- Step 3: Set admin user
UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'ophelia7067@tiffincrane.com';

-- Step 4: Verify admin user
SELECT 
  email, 
  full_name, 
  is_admin, 
  is_banned,
  created_at
FROM user_profiles 
WHERE email = 'ophelia7067@tiffincrane.com';

-- Step 5: Check all tables have data
SELECT 
  'user_profiles' as table_name, 
  COUNT(*)::int as row_count 
FROM user_profiles
UNION ALL
SELECT 
  'neighborhoods' as table_name, 
  COUNT(*)::int as row_count 
FROM neighborhoods
UNION ALL
SELECT 
  'buildings' as table_name, 
  COUNT(*)::int as row_count 
FROM buildings
UNION ALL
SELECT 
  'neighborhood_reviews' as table_name, 
  COUNT(*)::int as row_count 
FROM neighborhood_reviews
UNION ALL
SELECT 
  'building_reviews' as table_name, 
  COUNT(*)::int as row_count 
FROM building_reviews;

-- Step 6: Check for pending reviews
SELECT 
  'neighborhood_reviews' as type,
  COUNT(*)::int as pending_count
FROM neighborhood_reviews
WHERE status = 'pending'
UNION ALL
SELECT 
  'building_reviews' as type,
  COUNT(*)::int as pending_count
FROM building_reviews
WHERE status = 'pending';

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ ADMIN ACCESS FIXED!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS disabled on all tables';
  RAISE NOTICE '✅ All policies dropped';
  RAISE NOTICE '✅ Admin user updated';
  RAISE NOTICE '';
  RAISE NOTICE 'Check the results above to see:';
  RAISE NOTICE '1. Admin user details';
  RAISE NOTICE '2. Row counts for all tables';
  RAISE NOTICE '3. Pending review counts';
  RAISE NOTICE '';
  RAISE NOTICE 'If tables are empty, you need to:';
  RAISE NOTICE '1. Create some neighborhoods/buildings';
  RAISE NOTICE '2. Submit some reviews';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

