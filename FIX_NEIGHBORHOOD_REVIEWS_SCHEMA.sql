-- Fix neighborhood_reviews table schema
-- Run this in your Supabase SQL Editor

-- First, check the current schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'neighborhood_reviews'
ORDER BY ordinal_position;

-- Make the review column nullable (since comment is optional)
ALTER TABLE neighborhood_reviews 
ALTER COLUMN review DROP NOT NULL;

-- Update the column default
ALTER TABLE neighborhood_reviews 
ALTER COLUMN review SET DEFAULT '';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'neighborhood_reviews' AND column_name IN ('review', 'comment')
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Fixed neighborhood_reviews schema!' as result;
