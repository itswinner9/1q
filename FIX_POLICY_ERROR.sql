-- ✅ FIX INFINITE RECURSION ERROR
-- This will fix the RLS policy issue

-- Step 1: Drop ALL existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;

-- Step 2: Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" 
ON user_profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON user_profiles FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON user_profiles FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 3: Make sure table exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 4: Insert your admin user
INSERT INTO user_profiles (id, email, is_admin)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  true
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  email = 'tami76@tiffincrane.com';

-- Step 5: Verify
SELECT id, email, is_admin FROM user_profiles WHERE email = 'tami76@tiffincrane.com';
