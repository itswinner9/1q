-- ✅ FIX USER PROFILE - FINAL VERSION
-- This fixes the foreign key constraint error

-- Step 1: Check current user_profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 2: Drop and recreate user_profiles table with correct structure
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS and create simple policy
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for user_profiles" 
ON user_profiles FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 4: Insert your admin user (using your actual user ID)
INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  'Admin User',
  true,
  false
);

-- Step 5: Verify admin user was created
SELECT 'user_profiles table created successfully' as status;

SELECT id, email, full_name, is_admin, is_banned, created_at
FROM user_profiles
WHERE email = 'tami76@tiffincrane.com';

-- Step 6: Show all auth.users to verify your user exists
SELECT id, email, created_at
FROM auth.users
WHERE email = 'tami76@tiffincrane.com'
LIMIT 5;

-- ✅ User profiles should work now!
