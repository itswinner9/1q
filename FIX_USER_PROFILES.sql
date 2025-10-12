-- ✅ FIX USER PROFILES TABLE - This WILL work!

-- Step 1: Drop the problematic table completely
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 2: Create a fresh, simple table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 3: Enable RLS (but with simple policies)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
CREATE POLICY "Allow all authenticated users to read profiles" 
ON user_profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert profiles" 
ON user_profiles FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update profiles" 
ON user_profiles FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 5: Add your admin user
INSERT INTO user_profiles (id, email, is_admin)
VALUES (
  '6c708000-df9f-4df0-a665-5868a07b62ec', 
  'tami76@tiffincrane.com', 
  true
);

-- Step 6: Verify it worked
SELECT id, email, is_admin, created_at 
FROM user_profiles 
WHERE email = 'tami76@tiffincrane.com';

-- ✅ You should see your user with is_admin = true
