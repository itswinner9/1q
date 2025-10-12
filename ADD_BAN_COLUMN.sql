-- ✅ ADD BAN FUNCTIONALITY TO USER PROFILES

-- Add is_banned column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Update the RLS policies to allow admins to manage bans
DROP POLICY IF EXISTS "Allow all authenticated users to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to update profiles" ON user_profiles;

CREATE POLICY "Allow authenticated users to read profiles" 
ON user_profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update profiles" 
ON user_profiles FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the column was added
SELECT id, email, is_admin, is_banned, created_at 
FROM user_profiles 
WHERE email = 'tami76@tiffincrane.com';
