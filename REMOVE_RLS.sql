-- 🚨 REMOVE RLS FROM USER_PROFILES - Fix login issues

-- Step 1: Disable RLS on user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Enable all for user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow all authenticated users full access to user_profiles" ON user_profiles;

-- Step 3: Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Step 4: Test access
SELECT COUNT(*) as total_users FROM user_profiles;
SELECT email, is_admin, is_banned FROM user_profiles LIMIT 5;

-- ✅ RLS completely removed! Login should work now!
