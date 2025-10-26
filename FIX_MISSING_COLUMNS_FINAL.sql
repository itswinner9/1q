-- ════════════════════════════════════════════════════════════════════════════
-- 🔧 FIX MISSING COLUMNS - ADD ALL MISSING COLUMNS
-- ════════════════════════════════════════════════════════════════════════════

-- Add missing columns to neighborhood_reviews
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS safety INTEGER CHECK (safety BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS noise INTEGER CHECK (noise BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS community INTEGER CHECK (community BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to building_reviews
ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS management INTEGER CHECK (management BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS rent_value INTEGER CHECK (rent_value BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS noise INTEGER CHECK (noise BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to landlord_reviews
ALTER TABLE landlord_reviews 
ADD COLUMN IF NOT EXISTS responsiveness INTEGER CHECK (responsiveness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS communication INTEGER CHECK (communication BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS fairness INTEGER CHECK (fairness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to rent_company_reviews
ALTER TABLE rent_company_reviews 
ADD COLUMN IF NOT EXISTS service_quality INTEGER CHECK (service_quality BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS pricing INTEGER CHECK (pricing BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS communication INTEGER CHECK (communication BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS reliability INTEGER CHECK (reliability BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make review column nullable if it's not already
ALTER TABLE neighborhood_reviews ALTER COLUMN review DROP NOT NULL;
ALTER TABLE building_reviews ALTER COLUMN review DROP NOT NULL;
ALTER TABLE landlord_reviews ALTER COLUMN review DROP NOT NULL;
ALTER TABLE rent_company_reviews ALTER COLUMN review DROP NOT NULL;

-- Set default values for review and overall_rating
ALTER TABLE neighborhood_reviews ALTER COLUMN review SET DEFAULT '';
ALTER TABLE building_reviews ALTER COLUMN review SET DEFAULT '';
ALTER TABLE landlord_reviews ALTER COLUMN review SET DEFAULT '';
ALTER TABLE rent_company_reviews ALTER COLUMN review SET DEFAULT '';

-- Show success message
SELECT '✅ All missing columns have been added!' as status;

-- Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('neighborhood_reviews', 'building_reviews', 'landlord_reviews', 'rent_company_reviews')
  AND column_name IN ('amenities', 'safety', 'cleanliness', 'noise', 'community', 'comment', 'images', 'updated_at',
                      'management', 'maintenance', 'rent_value',
                      'responsiveness', 'fairness', 'professionalism',
                      'service_quality', 'pricing', 'reliability', 'communication')
ORDER BY table_name, column_name;
