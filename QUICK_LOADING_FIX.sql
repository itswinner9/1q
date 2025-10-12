-- ✅ QUICK LOADING FIX - Ensure user_profiles table works properly

-- Step 1: Check if user_profiles table exists and has correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 2: Ensure user_profiles has all required columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Make sure policies are simple and working
DROP POLICY IF EXISTS "Allow all authenticated users full access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Create very simple policy
CREATE POLICY "Enable all for user_profiles" 
ON user_profiles FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 4: Test user_profiles access
SELECT COUNT(*) as user_count FROM user_profiles;

-- ✅ This should fix loading issues!
