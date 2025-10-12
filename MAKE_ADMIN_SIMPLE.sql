-- ✅ SIMPLE ADMIN FIX
-- This WILL work! Just copy and run in Supabase SQL Editor

-- Step 1: Make sure table exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 2: Insert OR update your user as admin
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

-- Step 3: Verify it worked
SELECT id, email, is_admin FROM user_profiles WHERE email = 'tami76@tiffincrane.com';

-- ✅ If you see your email with is_admin = true, you're done!

