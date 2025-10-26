-- Add overall_rating to neighborhoods if it doesn't exist
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS overall_rating NUMERIC(3, 2) DEFAULT 0;

-- Add overall_rating to buildings if it doesn't exist
ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS overall_rating NUMERIC(3, 2) DEFAULT 0;

-- Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN ('neighborhoods', 'buildings')
  AND column_name IN ('overall_rating', 'average_rating')
ORDER BY table_name, column_name;

SELECT '✅ overall_rating columns verified!' as status;
