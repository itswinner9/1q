-- Fix overall_rating for all landlord reviews
-- This recalculates based on the average of all 5 rating categories

UPDATE landlord_reviews
SET overall_rating = ROUND(
  (
    COALESCE(responsiveness_rating, 0) +
    COALESCE(maintenance_rating, 0) +
    COALESCE(communication_rating, 0) +
    COALESCE(fairness_rating, 0) +
    COALESCE(professionalism_rating, 0)
  ) / 5.0,
  1
)
WHERE responsiveness_rating IS NOT NULL
   OR maintenance_rating IS NOT NULL
   OR communication_rating IS NOT NULL
   OR fairness_rating IS NOT NULL
   OR professionalism_rating IS NOT NULL;

-- Show updated results
SELECT 
  id,
  overall_rating,
  responsiveness_rating,
  maintenance_rating,
  communication_rating,
  fairness_rating,
  professionalism_rating,
  ROUND(
    (
      COALESCE(responsiveness_rating, 0) +
      COALESCE(maintenance_rating, 0) +
      COALESCE(communication_rating, 0) +
      COALESCE(fairness_rating, 0) +
      COALESCE(professionalism_rating, 0)
    ) / 5.0,
    1
  ) as calculated_overall
FROM landlord_reviews
WHERE status = 'approved'
ORDER BY created_at DESC;

-- Success message
SELECT '✅ All landlord review ratings have been recalculated!' as status;
