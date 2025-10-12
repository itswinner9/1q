-- 🔍 CHECK IF ALL TABLES EXIST AND ARE SET UP CORRECTLY

-- Step 1: Check if all required tables exist
SELECT 'Tables Check:' as test;
SELECT 
  table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = t.table_name
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
  VALUES 
    ('user_profiles'),
    ('neighborhoods'),
    ('buildings'),
    ('neighborhood_reviews'),
    ('building_reviews')
) AS t(table_name);

-- Step 2: Check table structures
SELECT 'user_profiles columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

SELECT 'neighborhoods columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'neighborhoods'
ORDER BY ordinal_position;

SELECT 'buildings columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'buildings'
ORDER BY ordinal_position;

SELECT 'neighborhood_reviews columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'neighborhood_reviews'
ORDER BY ordinal_position;

SELECT 'building_reviews columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'building_reviews'
ORDER BY ordinal_position;

-- Step 3: Check RLS status
SELECT 'RLS Status:' as info;
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '⚠️ ENABLED' ELSE '✅ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'neighborhoods', 'buildings', 'neighborhood_reviews', 'building_reviews')
ORDER BY tablename;

-- Step 4: Check if triggers exist
SELECT 'Triggers:' as info;
SELECT 
  trigger_name,
  event_object_table,
  event_manipulation,
  '✅ EXISTS' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_auth_user_created', 'auto_approve_neighborhood_trigger', 'auto_approve_building_trigger', 'neighborhood_review_stats_trigger', 'building_review_stats_trigger')
ORDER BY trigger_name;

-- Step 5: Check data counts
SELECT 'Data Counts:' as info;
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'neighborhoods', COUNT(*) FROM neighborhoods
UNION ALL
SELECT 'buildings', COUNT(*) FROM buildings
UNION ALL
SELECT 'neighborhood_reviews', COUNT(*) FROM neighborhood_reviews
UNION ALL
SELECT 'building_reviews', COUNT(*) FROM building_reviews;

-- ✅ This shows you exactly what's set up and what's missing!
