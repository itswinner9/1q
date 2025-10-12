-- ═══════════════════════════════════════════════════════════════
-- 🔐 ROLE-BASED AUTHENTICATION SYSTEM
-- ═══════════════════════════════════════════════════════════════
-- This sets up admin and normal user roles
-- ═══════════════════════════════════════════════════════════════

-- ============================================
-- STEP 1: Create user_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for simplicity (you can enable and add policies later)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin ON user_profiles(is_admin) WHERE is_admin = true;

-- ============================================
-- STEP 2: Auto-create profile trigger
-- ============================================
-- This function creates a user_profile automatically when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    false  -- Default to normal user
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If insert fails (e.g., duplicate), just continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 3: Sync existing users
-- ============================================
-- Insert profiles for any existing auth.users who don't have profiles yet
INSERT INTO user_profiles (id, email, full_name, is_admin)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  false
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: Promote specific users to admin
-- ============================================
-- Example: Make a specific user an admin
-- UPDATE user_profiles SET is_admin = true WHERE email = 'admin@example.com';

-- For your app, set the main admin
UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'tami76@tiffincrane.com';

-- ============================================
-- STEP 5: Verify setup
-- ============================================
SELECT '✅ Role-Based Auth Setup Complete!' as status;
SELECT 'Total users:' as info, COUNT(*)::text FROM user_profiles;
SELECT 'Admin users:' as info, email, is_admin FROM user_profiles WHERE is_admin = true;
SELECT 'Normal users:' as info, COUNT(*)::text FROM user_profiles WHERE is_admin = false;

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE! Now run the Next.js code setup
-- ═══════════════════════════════════════════════════════════════

-- 📝 To manually promote users to admin, use:
-- UPDATE user_profiles SET is_admin = true WHERE email = 'user@example.com';

-- 📝 To demote admins to normal users, use:
-- UPDATE user_profiles SET is_admin = false WHERE email = 'user@example.com';

