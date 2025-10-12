-- ✅ FIX MISSING COLUMNS - Add the missing columns to user_profiles

-- Step 1: Check current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 2: Add missing columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Step 3: Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 4: Test insert with correct columns
INSERT INTO user_profiles (id, email, is_admin, is_banned)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  'test@example.com',
  false,
  false
);

-- Step 5: Clean up test data
DELETE FROM user_profiles WHERE email = 'test@example.com';

-- Step 6: Ensure your admin user has all columns
INSERT INTO user_profiles (id, email, is_admin, is_banned, full_name)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  true,
  false,
  'Admin User'
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  email = 'tami76@tiffincrane.com',
  full_name = 'Admin User',
  is_banned = false;

-- Step 7: Verify admin user exists
SELECT id, email, is_admin, is_banned, full_name 
FROM user_profiles 
WHERE email = 'tami76@tiffincrane.com';

-- ✅ Registration should work now!
