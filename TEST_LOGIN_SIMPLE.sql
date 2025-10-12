-- 🧪 SIMPLE TEST - Check if login can work

-- Step 1: Check if user_profiles table exists
SELECT 'user_profiles exists:' as test, 
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = 'user_profiles'
       ) THEN '✅ YES' ELSE '❌ NO' END as result;

-- Step 2: Check RLS status
SELECT 'RLS Status:' as test,
       CASE WHEN rowsecurity THEN '⚠️ ENABLED (BAD)' ELSE '✅ DISABLED (GOOD)' END as result
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Step 3: Count users
SELECT 'Total Users:' as test, COUNT(*)::text || ' users' as result 
FROM user_profiles;

-- Step 4: Check auth.users
SELECT 'Auth Users:' as test, COUNT(*)::text || ' auth users' as result 
FROM auth.users;

-- Step 5: Check if they match
SELECT 'Sync Status:' as test,
       CASE 
         WHEN (SELECT COUNT(*) FROM user_profiles) = (SELECT COUNT(*) FROM auth.users) 
         THEN '✅ ALL SYNCED' 
         ELSE '⚠️ MISSING ' || ((SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM user_profiles))::text || ' users'
       END as result;

-- Step 6: List all users
SELECT '📋 All Users:' as info, email, is_admin 
FROM user_profiles 
ORDER BY created_at DESC;

-- ✅ If everything shows ✅, login should work!
