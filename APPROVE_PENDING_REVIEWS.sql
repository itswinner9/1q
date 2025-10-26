-- APPROVE ALL PENDING REVIEWS TO MAKE THEM VISIBLE
-- Run this in your Supabase SQL Editor

-- ===================================================================
-- APPROVE building_reviews
-- ===================================================================

-- Approve all reviews with avg rating >= 2.0 (already auto-approved by form)
UPDATE building_reviews 
SET status = 'approved'
WHERE status = 'pending' 
   OR status IS NULL;

-- For testing: Approve ALL reviews regardless of rating
-- Uncomment below if you want to approve all reviews
UPDATE building_reviews 
SET status = 'approved';

-- ===================================================================
-- APPROVE neighborhood_reviews
-- ===================================================================

UPDATE neighborhood_reviews 
SET status = 'approved'
WHERE status = 'pending' 
   OR status IS NULL;

UPDATE neighborhood_reviews 
SET status = 'approved';

-- ===================================================================
-- APPROVE landlord_reviews
-- ===================================================================

UPDATE landlord_reviews 
SET status = 'approved'
WHERE status = 'pending' 
   OR status IS NULL;

UPDATE landlord_reviews 
SET status = 'approved';

-- ===================================================================
-- APPROVE rent_company_reviews
-- ===================================================================

UPDATE rent_company_reviews 
SET status = 'approved'
WHERE status = 'pending' 
   OR status IS NULL;

UPDATE rent_company_reviews 
SET status = 'approved';

-- ===================================================================
-- VERIFY CHANGES
-- ===================================================================

SELECT 'building_reviews' as table_name, status, COUNT(*) as count
FROM building_reviews
GROUP BY status
ORDER BY status;

SELECT 'neighborhood_reviews' as table_name, status, COUNT(*) as count
FROM neighborhood_reviews
GROUP BY status
ORDER BY status;

SELECT 'landlord_reviews' as table_name, status, COUNT(*) as count
FROM landlord_reviews
GROUP BY status
ORDER BY status;

SELECT 'rent_company_reviews' as table_name, status, COUNT(*) as count
FROM rent_company_reviews
GROUP BY status
ORDER BY status;

-- Success!
SELECT '✅ All reviews approved!' as result;
