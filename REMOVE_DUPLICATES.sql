-- ============================================
-- REMOVE DUPLICATE CARDS
-- This will keep only the most recent rating for each location
-- ============================================

-- For Neighborhoods: Keep most recent, delete older duplicates
DELETE FROM neighborhoods a
USING neighborhoods b
WHERE 
  a.name = b.name 
  AND a.city = b.city 
  AND a.province = b.province
  AND a.created_at < b.created_at;

-- For Buildings: Keep most recent, delete older duplicates
DELETE FROM buildings a
USING buildings b
WHERE 
  a.address = b.address 
  AND a.city = b.city
  AND a.created_at < b.created_at;

-- ============================================
-- ✅ DONE!
-- 
-- This removed all duplicate cards and kept only the newest one.
-- 
-- Now refresh your homepage - you should see:
-- • ONE "King George" card (not two!)
-- • With the most recent rating
-- ============================================

