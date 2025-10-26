-- COMPLETE FIX FOR ALL REVIEW TABLES
-- Run this in your Supabase SQL Editor
-- This will fix the schema and approve all existing reviews

-- ===================================================================
-- STEP 1: FIX building_reviews table
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
-- STEP 2: FIX neighborhood_reviews table
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
-- STEP 3: FIX landlord_reviews table
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
-- STEP 4: FIX rent_company_reviews table
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
-- STEP 5: APPROVE ALL EXISTING REVIEWS TO MAKE THEM VISIBLE
-- ===================================================================

UPDATE building_reviews 
SET status = 'approved'
WHERE status = 'pending' OR status IS NULL;

UPDATE neighborhood_reviews 
SET status = 'approved'
WHERE status = 'pending' OR status IS NULL;

UPDATE landlord_reviews 
SET status = 'approved'
WHERE status = 'pending' OR status IS NULL;

UPDATE rent_company_reviews 
SET status = 'approved'
WHERE status = 'pending' OR status IS NULL;

-- ===================================================================
-- STEP 6: VERIFY ALL CHANGES
-- ===================================================================

SELECT 'building_reviews' as table_name, COUNT(*) as total_reviews
FROM building_reviews
UNION ALL
SELECT 'neighborhood_reviews' as table_name, COUNT(*) as total_reviews
FROM neighborhood_reviews
UNION ALL
SELECT 'landlord_reviews' as table_name, COUNT(*) as total_reviews
FROM landlord_reviews
UNION ALL
SELECT 'rent_company_reviews' as table_name, COUNT(*) as total_reviews
FROM rent_company_reviews;

SELECT '✅ All review tables fixed and approved!' as result;
