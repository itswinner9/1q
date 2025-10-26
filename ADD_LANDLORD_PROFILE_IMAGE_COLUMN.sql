-- Add profile_image column to landlords table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE landlords 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Make sure the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'landlords' AND column_name = 'profile_image';
