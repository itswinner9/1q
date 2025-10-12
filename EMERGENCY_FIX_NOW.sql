-- 🚨 EMERGENCY FIX - Run this if login is hanging

-- This is the ABSOLUTE MINIMUM to make auth work
-- No fancy stuff, just what's needed for login

-- Step 1: Create user_profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: DISABLE RLS completely
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Create trigger for auto-profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Sync existing users
INSERT INTO user_profiles (id, email, full_name, is_admin)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', ''),
  CASE WHEN email = 'tami76@tiffincrane.com' THEN true ELSE false END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  is_admin = CASE WHEN user_profiles.email = 'tami76@tiffincrane.com' THEN true ELSE user_profiles.is_admin END;

-- Step 5: Verify
SELECT 'Users in auth.users:' as info, COUNT(*) FROM auth.users;
SELECT 'Users in user_profiles:' as info, COUNT(*) FROM user_profiles;
SELECT 'RLS disabled:' as info, NOT rowsecurity FROM pg_tables WHERE tablename = 'user_profiles';

-- ✅ DONE! Try login now!
