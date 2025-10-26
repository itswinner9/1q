-- Fix the specific landlord rating manually
-- This recalculates the overall_rating based on all 5 categories

UPDATE landlords
SET
  overall_rating = (
    SELECT AVG(
      (responsiveness_rating + maintenance_rating + communication_rating + fairness_rating + professionalism_rating) / 5.0
    )::NUMERIC(3,2)
    FROM landlord_reviews
    WHERE landlord_id = landlords.id
      AND status = 'approved'
  )
WHERE city = 'surrey' 
  AND province = 'British Columbia';

-- Also recalculate all category averages properly
UPDATE landlords
SET
  responsiveness_rating = COALESCE((
    SELECT AVG(responsiveness_rating)::NUMERIC(3,2)
    FROM landlord_reviews
    WHERE landlord_id = landlords.id
      AND status = 'approved'
      AND responsiveness_rating IS NOT NULL
  ), 0),
  maintenance_rating = COALESCE((
    SELECT AVG(maintenance_rating)::NUMERIC(3,2)
    FROM landlord_reviews
    WHERE landlord_id = landlords.id
      AND status = 'approved'
      AND maintenance_rating IS NOT NULL
  ), 0),
  communication_rating = COALESCE((
    SELECT AVG(communication_rating)::NUMERIC(3,2)
    FROM landlord_reviews
    WHERE landlord_id = landlords.id
      AND status = 'approved'
      AND communication_rating IS NOT NULL
  ), 0),
  fairness_rating = COALESCE((
    SELECT AVG(fairness_rating)::NUMERIC(3,2)
    FROM landlord_reviews
    WHERE landlord_id = landlords.id
      AND status = 'approved'
      AND fairness_rating IS NOT NULL
  ), 0),
  professionalism_rating = COALESCE((
    SELECT AVG(professionalism_rating)::NUMERIC(3,2)
    FROM landlord_reviews
    WHERE landlord_id = landlords.id
      AND status = 'approved'
      AND professionalism_rating IS NOT NULL
  ), 0),
  total_reviews = (
    SELECT COUNT(*)
    FROM landlord_reviews
    WHERE landlord_id = landlords.id
      AND status = 'approved'
  )
WHERE city = 'surrey' 
  AND province = 'British Columbia';

-- Show the updated rating
SELECT 
  name,
  city,
  province,
  overall_rating,
  responsiveness_rating,
  maintenance_rating,
  communication_rating,
  fairness_rating,
  professionalism_rating,
  total_reviews
FROM landlords
WHERE city = 'surrey' 
  AND province = 'British Columbia';
