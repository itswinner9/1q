-- ═══════════════════════════════════════════════════════════════
-- RECALCULATE RATINGS - Fix average_rating and total_reviews
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor if locations don't show on homepage
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Update neighborhood ratings from approved reviews
UPDATE neighborhoods n
SET 
  average_rating = COALESCE((
    SELECT AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0)
    FROM neighborhood_reviews
    WHERE neighborhood_id = n.id AND status = 'approved'
  ), 0),
  total_reviews = COALESCE((
    SELECT COUNT(*)::INTEGER
    FROM neighborhood_reviews
    WHERE neighborhood_id = n.id AND status = 'approved'
  ), 0),
  updated_at = NOW();

-- Step 2: Update building ratings from approved reviews
UPDATE buildings b
SET 
  average_rating = COALESCE((
    SELECT AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0)
    FROM building_reviews
    WHERE building_id = b.id AND status = 'approved'
  ), 0),
  total_reviews = COALESCE((
    SELECT COUNT(*)::INTEGER
    FROM building_reviews
    WHERE building_id = b.id AND status = 'approved'
  ), 0),
  updated_at = NOW();

-- Step 3: Show results
SELECT 
  'NEIGHBORHOODS' as type,
  name,
  city,
  average_rating,
  total_reviews,
  created_at
FROM neighborhoods
ORDER BY average_rating DESC, total_reviews DESC;

SELECT 
  'BUILDINGS' as type,
  name,
  city,
  average_rating,
  total_reviews,
  created_at
FROM buildings
ORDER BY average_rating DESC, total_reviews DESC;

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ RATINGS RECALCULATED!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Check the results above to see:';
  RAISE NOTICE '- All neighborhoods with their ratings';
  RAISE NOTICE '- All buildings with their ratings';
  RAISE NOTICE '';
  RAISE NOTICE 'Now refresh your homepage!';
  RAISE NOTICE '════════════════════════════════════════';
END $$;


