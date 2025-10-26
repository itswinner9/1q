-- Fix review column NOT NULL constraint
-- Run this in your Supabase SQL Editor

-- Remove the NOT NULL constraint from review column
ALTER TABLE neighborhood_reviews 
ALTER COLUMN review DROP NOT NULL;

-- Set a default value for review column
ALTER TABLE neighborhood_reviews 
ALTER COLUMN review SET DEFAULT '';

-- Verify the fix
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'neighborhood_reviews' 
  AND column_name = 'review';

-- Success!
SELECT '✅ Review column is now nullable!' as result;
