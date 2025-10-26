-- Fix Landlord Ratings Trigger to only count approved reviews
-- Run this SQL in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION update_landlord_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE landlords
  SET
    overall_rating = COALESCE((
      SELECT AVG(overall_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND status = 'approved'
    ), 0),
    responsiveness_rating = COALESCE((
      SELECT AVG(responsiveness_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND responsiveness_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    maintenance_rating = COALESCE((
      SELECT AVG(maintenance_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND maintenance_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    communication_rating = COALESCE((
      SELECT AVG(communication_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND communication_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    fairness_rating = COALESCE((
      SELECT AVG(fairness_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND fairness_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    professionalism_rating = COALESCE((
      SELECT AVG(professionalism_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND professionalism_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.landlord_id, OLD.landlord_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- The trigger should already exist, but verify it's set up correctly
DROP TRIGGER IF EXISTS update_landlord_ratings_trigger ON landlord_reviews;
CREATE TRIGGER update_landlord_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON landlord_reviews
  FOR EACH ROW EXECUTE FUNCTION update_landlord_ratings();

-- Test: Check if function updated successfully
SELECT '✅ Landlord ratings function updated successfully!' as status;
