-- Add updated_at columns to review tables
-- Run this SQL in your Supabase SQL Editor

-- Add to building_reviews if missing
ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Add to neighborhood_reviews if missing
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Add to landlord_reviews if missing
ALTER TABLE landlord_reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Add to rent_company_reviews if missing
ALTER TABLE rent_company_reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN ('building_reviews', 'neighborhood_reviews', 'landlord_reviews', 'rent_company_reviews')
  AND column_name = 'updated_at'
ORDER BY table_name;

-- Success message
SELECT '✅ updated_at columns added successfully!' as status;
