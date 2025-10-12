-- ✅ FIX USER PROFILE ISSUES
-- This addresses common user profile problems

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

-- Step 4: Insert your admin user
INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  'Admin User',
  true,
  false
);

-- Step 5: Test user profile creation
INSERT INTO user_profiles (id, email, full_name, is_admin, is_banned)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'test@example.com',
  'Test User',
  false,
  false
);

-- Step 6: Verify everything works
SELECT 'user_profiles table created successfully' as status;

SELECT id, email, full_name, is_admin, is_banned, created_at
FROM user_profiles
ORDER BY created_at;

-- Step 7: Clean up test data
DELETE FROM user_profiles WHERE email = 'test@example.com';

-- ✅ User profiles should work now!
