-- Fix user_profiles table to add missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update the make_user_admin function to work with the correct schema
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RETURN 'User not found. Please make sure they have signed up first.';
  END IF;

  -- Insert or update user profile
  INSERT INTO user_profiles (id, email, is_admin, display_name)
  VALUES (user_uuid, user_email, true, split_part(user_email, '@', 1))
  ON CONFLICT (id) 
  DO UPDATE SET 
    is_admin = true,
    display_name = COALESCE(user_profiles.display_name, split_part(user_email, '@', 1)),
    email = user_email;

  RETURN 'User ' || user_email || ' is now an admin!';
END;
$$ LANGUAGE plpgsql;

-- Now make the user admin
SELECT make_user_admin('nnoqrdcchtkzwvj@teihu.com');

-- Verify the user is now admin
SELECT id, email, is_admin, display_name, role
FROM user_profiles 
WHERE email = 'nnoqrdcchtkzwvj@teihu.com';