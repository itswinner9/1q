-- FIX ALL REVIEW TABLES TO WORK WITH FORMS
-- Run this in your Supabase SQL Editor

-- ===================================================================
-- FIX building_reviews table
-- ===================================================================

-- Add missing columns that the form uses
ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS management INTEGER CHECK (management BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS rent_value INTEGER CHECK (rent_value BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS noise INTEGER CHECK (noise BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Make review and overall_rating nullable if they are NOT NULL
ALTER TABLE building_reviews 
ALTER COLUMN review DROP NOT NULL,
ALTER COLUMN overall_rating DROP NOT NULL;

-- Add defaults
ALTER TABLE building_reviews 
ALTER COLUMN review SET DEFAULT '',
ALTER COLUMN overall_rating SET DEFAULT 0;

-- ===================================================================
-- FIX neighborhood_reviews table
-- ===================================================================

-- Add missing columns that the form uses
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS safety INTEGER CHECK (safety BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS noise INTEGER CHECK (noise BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS community INTEGER CHECK (community BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS transit INTEGER CHECK (transit BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Make review and overall_rating nullable if they are NOT NULL
ALTER TABLE neighborhood_reviews 
ALTER COLUMN review DROP NOT NULL,
ALTER COLUMN overall_rating DROP NOT NULL;

-- Add defaults
ALTER TABLE neighborhood_reviews 
ALTER COLUMN review SET DEFAULT '',
ALTER COLUMN overall_rating SET DEFAULT 0;

-- ===================================================================
-- FIX landlord_reviews table
-- ===================================================================

-- Add missing columns that the form uses
ALTER TABLE landlord_reviews 
ADD COLUMN IF NOT EXISTS responsiveness INTEGER CHECK (responsiveness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS communication INTEGER CHECK (communication BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS fairness INTEGER CHECK (fairness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Make review and overall_rating nullable if they are NOT NULL
ALTER TABLE landlord_reviews 
ALTER COLUMN review DROP NOT NULL,
ALTER COLUMN overall_rating DROP NOT NULL;

-- Add defaults
ALTER TABLE landlord_reviews 
ALTER COLUMN review SET DEFAULT '',
ALTER COLUMN overall_rating SET DEFAULT 0;

-- ===================================================================
-- FIX rent_company_reviews table
-- ===================================================================

-- Add missing columns that the form uses
ALTER TABLE rent_company_reviews 
ADD COLUMN IF NOT EXISTS service_quality INTEGER CHECK (service_quality BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS pricing INTEGER CHECK (pricing BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS communication INTEGER CHECK (communication BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS reliability INTEGER CHECK (reliability BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Make review and overall_rating nullable if they are NOT NULL
ALTER TABLE rent_company_reviews 
ALTER COLUMN review DROP NOT NULL,
ALTER COLUMN overall_rating DROP NOT NULL;

-- Add defaults
ALTER TABLE rent_company_reviews 
ALTER COLUMN review SET DEFAULT '',
ALTER COLUMN overall_rating SET DEFAULT 0;

-- ===================================================================
-- VERIFY ALL CHANGES
-- ===================================================================

SELECT 'building_reviews' as table_name, column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'building_reviews' 
  AND column_name IN ('review', 'overall_rating', 'management', 'cleanliness', 'comment')
ORDER BY column_name;

SELECT 'neighborhood_reviews' as table_name, column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'neighborhood_reviews' 
  AND column_name IN ('review', 'overall_rating', 'safety', 'cleanliness', 'comment')
ORDER BY column_name;

SELECT 'landlord_reviews' as table_name, column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'landlord_reviews' 
  AND column_name IN ('review', 'overall_rating', 'responsiveness', 'maintenance', 'comment')
ORDER BY column_name;

SELECT 'rent_company_reviews' as table_name, column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'rent_company_reviews' 
  AND column_name IN ('review', 'overall_rating', 'service_quality', 'pricing', 'comment')
ORDER BY column_name;

-- Success!
SELECT '✅ All review tables fixed!' as result;
