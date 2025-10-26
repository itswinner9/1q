-- ═══════════════════════════════════════════════════════════════
-- CHECK AND FIX RATINGS - Quick Diagnostic and Fix
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Check what reviews exist
SELECT 
  'Building Reviews' as type,
  br.id,
  b.name as building_name,
  b.address,
  br.status,
  br.management,
  br.cleanliness,
  br.maintenance,
  br.rent_value,
  br.noise,
  br.amenities,
  (br.management + br.cleanliness + br.maintenance + br.rent_value + br.noise + br.amenities) / 6.0 as avg_rating,
  br.created_at
FROM building_reviews br
LEFT JOIN buildings b ON b.id = br.building_id
ORDER BY br.created_at DESC;

-- Step 2: Check building stats
SELECT 
  name,
  address,
  city,
  average_rating,
  total_reviews,
  created_at
FROM buildings
ORDER BY created_at DESC;

-- Step 3: Approve ALL pending reviews (if any)
UPDATE building_reviews
SET status = 'approved'
WHERE status = 'pending';

UPDATE neighborhood_reviews
SET status = 'approved'
WHERE status = 'pending';

-- Step 4: Manually recalculate ALL building ratings
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

-- Step 5: Manually recalculate ALL neighborhood ratings
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

-- Step 6: Show updated results
SELECT 
  'BUILDINGS AFTER UPDATE' as info,
  name,
  address,
  average_rating,
  total_reviews
FROM buildings
WHERE total_reviews > 0
ORDER BY average_rating DESC;

SELECT 
  'NEIGHBORHOODS AFTER UPDATE' as info,
  name,
  city,
  average_rating,
  total_reviews
FROM neighborhoods
WHERE total_reviews > 0
ORDER BY average_rating DESC;

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ RATINGS FIXED!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All pending reviews approved';
  RAISE NOTICE '✅ All ratings recalculated';
  RAISE NOTICE '✅ Averages updated';
  RAISE NOTICE '';
  RAISE NOTICE 'Now refresh your pages to see ratings!';
  RAISE NOTICE '════════════════════════════════════════';
END $$;


