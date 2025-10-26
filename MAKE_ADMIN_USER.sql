-- Make user admin
-- Run this in your Supabase SQL Editor

-- First, check if the user exists
SELECT id, email FROM auth.users WHERE email = 'nnoqrdcchtkzwvj@teihu.com';

-- If the user exists, make them admin
SELECT make_user_admin('nnoqrdcchtkzwvj@teihu.com');

-- Verify the user is now admin
SELECT id, email, is_admin, display_name 
FROM user_profiles 
WHERE email = 'nnoqrdcchtkzwvj@teihu.com';
