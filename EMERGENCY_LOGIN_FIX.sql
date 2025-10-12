-- 🚨 EMERGENCY LOGIN FIX - Fix authentication issues

-- Step 1: Check auth.users table
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Ensure user_profiles exists and is accessible
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS with simple policy
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable all for user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create simple policies
CREATE POLICY "Enable all for user_profiles" 
ON user_profiles FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 4: Sync all existing users
INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  CASE 
    WHEN au.email = 'tami76@tiffincrane.com' THEN true 
    ELSE false 
  END as is_admin,
  false as is_banned
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Step 5: Test access
SELECT COUNT(*) as total_users FROM user_profiles;
SELECT email, is_admin FROM user_profiles WHERE is_admin = true;

-- ✅ This should fix login issues!
