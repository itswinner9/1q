-- ✅ DEBUG USER REGISTRATION ISSUE

-- Step 1: Check if user_profiles table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 2: Check if there are any triggers on user_profiles
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles';

-- Step 3: Check if there are any constraints
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_profiles';

-- Step 4: Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Step 5: Try to create a test user profile manually
INSERT INTO user_profiles (id, email, is_admin, full_name, is_banned)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  'test@example.com',
  false,
  'Test User',
  false
);

-- Step 6: Clean up test data
DELETE FROM user_profiles WHERE email = 'test@example.com';

-- Step 7: Show current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
