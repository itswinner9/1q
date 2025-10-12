-- ✅ SYNC ALL USERS TO USER_PROFILES TABLE
-- This will add all existing auth.users to user_profiles

-- Step 1: Show all users in auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at;

-- Step 2: Show current user_profiles
SELECT id, email, full_name, is_admin, is_banned, created_at
FROM user_profiles
ORDER BY created_at;

-- Step 3: Insert all auth.users into user_profiles (if they don't exist)
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

-- Step 4: Update existing user profiles with missing data
UPDATE user_profiles 
SET 
  email = au.email,
  full_name = COALESCE(au.raw_user_meta_data->>'full_name', user_profiles.full_name),
  is_admin = CASE 
    WHEN au.email = 'tami76@tiffincrane.com' THEN true 
    ELSE user_profiles.is_admin 
  END
FROM auth.users au
WHERE user_profiles.id = au.id;

-- Step 5: Show final user_profiles table
SELECT 'All users synced to user_profiles' as status;

SELECT 
  id, 
  email, 
  full_name, 
  is_admin, 
  is_banned, 
  created_at,
  CASE WHEN is_admin THEN '👑 ADMIN' ELSE '👤 USER' END as role
FROM user_profiles
ORDER BY is_admin DESC, created_at;

-- Step 6: Count users by type
SELECT 
  'Total Users' as category,
  COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
  'Admins' as category,
  COUNT(*) as count
FROM user_profiles
WHERE is_admin = true
UNION ALL
SELECT 
  'Regular Users' as category,
  COUNT(*) as count
FROM user_profiles
WHERE is_admin = false;

-- ✅ All users should now appear in admin page!
