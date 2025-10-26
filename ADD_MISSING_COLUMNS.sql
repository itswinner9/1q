-- ═══════════════════════════════════════════════════════════════
-- ADD MISSING COLUMNS FOR ADMIN REVIEW WORKFLOW
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add missing columns to neighborhood_reviews
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add missing columns to building_reviews
ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Verify columns were added
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'neighborhood_reviews' 
  AND column_name IN ('approved_by', 'approved_at', 'rejection_reason')
ORDER BY column_name;

SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'building_reviews' 
  AND column_name IN ('approved_by', 'approved_at', 'rejection_reason')
ORDER BY column_name;

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ MISSING COLUMNS ADDED!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added to neighborhood_reviews:';
  RAISE NOTICE '   - approved_by (UUID)';
  RAISE NOTICE '   - approved_at (TIMESTAMPTZ)';
  RAISE NOTICE '   - rejection_reason (TEXT)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added to building_reviews:';
  RAISE NOTICE '   - approved_by (UUID)';
  RAISE NOTICE '   - approved_at (TIMESTAMPTZ)';
  RAISE NOTICE '   - rejection_reason (TEXT)';
  RAISE NOTICE '';
  RAISE NOTICE 'Now try approving/rejecting reviews again!';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

