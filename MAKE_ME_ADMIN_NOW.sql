-- ============================================
-- MAKE ME ADMIN - SIMPLE & DIRECT
-- Run this to become admin immediately
-- ============================================

-- Step 1: Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 2: Insert or update your profile as admin
INSERT INTO user_profiles (id, email, is_admin)
SELECT id, email, true 
FROM auth.users 
WHERE email = 'tami76@tiffincrane.com'
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;

-- Step 3: Verify you're admin (should return 1 row)
SELECT email, is_admin FROM user_profiles WHERE is_admin = true;

-- ============================================
-- ✅ DONE! You should see your email with is_admin = true
-- 
-- Now:
-- 1. Refresh http://localhost:3001
-- 2. Login
-- 3. Click Account → Admin Panel
-- 4. You're in! ✅
-- ============================================

