-- ═══════════════════════════════════════════════════════════════
-- MAKE USER ADMIN - Quick Admin Setup
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Make both users admin
UPDATE user_profiles 
SET is_admin = true 
WHERE email IN ('ophelia7067@tiffincrane.com', '25luise@tiffincrane.com');

-- Verify admin users
SELECT 
  email,
  full_name,
  is_admin,
  created_at
FROM user_profiles
WHERE is_admin = true;

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ ADMIN USERS SET!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Admins:';
  RAISE NOTICE '- ophelia7067@tiffincrane.com';
  RAISE NOTICE '- 25luise@tiffincrane.com';
  RAISE NOTICE '';
  RAISE NOTICE 'They can now:';
  RAISE NOTICE '✅ Access /admin panel';
  RAISE NOTICE '✅ Approve/reject reviews';
  RAISE NOTICE '✅ Manage users';
  RAISE NOTICE '✅ Upload cover images';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
END $$;


