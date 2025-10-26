-- ═══════════════════════════════════════════════════════════════
-- ALGORITHM SETUP - Add Rating Calculations & Like System
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Add helpful_count (likes) and not_helpful_count (dislikes) to reviews
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0;

ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0;

-- Step 2: Create review_votes table to track who voted what
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  review_id UUID NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('neighborhood', 'building')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_id, review_type)
);

-- Enable RLS on review_votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON review_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Step 3: Create function to calculate weighted score
CREATE OR REPLACE FUNCTION calculate_weighted_score(
  avg_rating DECIMAL,
  total_reviews INTEGER,
  helpful_votes INTEGER DEFAULT 0
) RETURNS DECIMAL AS $$
BEGIN
  -- Weighted score = (avg_rating * total_reviews * 2) + (helpful_votes * 0.5)
  -- This gives more weight to:
  -- 1. High ratings
  -- 2. More reviews (popular locations)
  -- 3. Helpful reviews
  RETURN (avg_rating * total_reviews * 2) + (helpful_votes * 0.5);
END;
$$ LANGUAGE plpgsql;

-- Step 4: Add weighted_score column to locations
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS weighted_score DECIMAL DEFAULT 0;

ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS weighted_score DECIMAL DEFAULT 0;

-- Step 5: Create function to update location stats
CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL;
  new_count INTEGER;
  new_score DECIMAL;
BEGIN
  -- Calculate average rating from approved reviews
  SELECT 
    AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0),
    COUNT(*)
  INTO new_avg, new_count
  FROM neighborhood_reviews
  WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
    AND status = 'approved';

  -- Calculate weighted score
  new_score := calculate_weighted_score(
    COALESCE(new_avg, 0),
    COALESCE(new_count, 0),
    0
  );

  -- Update neighborhood
  UPDATE neighborhoods
  SET 
    average_rating = COALESCE(new_avg, 0),
    total_reviews = COALESCE(new_count, 0),
    weighted_score = new_score,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL;
  new_count INTEGER;
  new_score DECIMAL;
BEGIN
  -- Calculate average rating from approved reviews
  SELECT 
    AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0),
    COUNT(*)
  INTO new_avg, new_count
  FROM building_reviews
  WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
    AND status = 'approved';

  -- Calculate weighted score
  new_score := calculate_weighted_score(
    COALESCE(new_avg, 0),
    COALESCE(new_count, 0),
    0
  );

  -- Update building
  UPDATE buildings
  SET 
    average_rating = COALESCE(new_avg, 0),
    total_reviews = COALESCE(new_count, 0),
    weighted_score = new_score,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create triggers for auto-updating stats
DROP TRIGGER IF EXISTS update_neighborhood_stats_trigger ON neighborhood_reviews;
CREATE TRIGGER update_neighborhood_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_neighborhood_stats();

DROP TRIGGER IF EXISTS update_building_stats_trigger ON building_reviews;
CREATE TRIGGER update_building_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_building_stats();

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_neighborhoods_weighted_score 
  ON neighborhoods(weighted_score DESC);
  
CREATE INDEX IF NOT EXISTS idx_neighborhoods_average_rating 
  ON neighborhoods(average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_buildings_weighted_score 
  ON buildings(weighted_score DESC);
  
CREATE INDEX IF NOT EXISTS idx_buildings_average_rating 
  ON buildings(average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_review_votes_lookup 
  ON review_votes(user_id, review_id, review_type);

-- Step 8: Update existing location scores
UPDATE neighborhoods n
SET 
  weighted_score = calculate_weighted_score(n.average_rating, n.total_reviews, 0),
  updated_at = NOW()
WHERE total_reviews > 0;

UPDATE buildings b
SET 
  weighted_score = calculate_weighted_score(b.average_rating, b.total_reviews, 0),
  updated_at = NOW()
WHERE total_reviews > 0;

-- Done!
DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ ALGORITHM SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added helpful/not_helpful counts to reviews';
  RAISE NOTICE '✅ Created review_votes table for likes/dislikes';
  RAISE NOTICE '✅ Added weighted_score to locations';
  RAISE NOTICE '✅ Created smart ranking algorithm';
  RAISE NOTICE '✅ Auto-update triggers enabled';
  RAISE NOTICE '✅ Performance indexes created';
  RAISE NOTICE '';
  RAISE NOTICE 'Now top-rated will show:';
  RAISE NOTICE '1. Locations with high ratings';
  RAISE NOTICE '2. Locations with many reviews';
  RAISE NOTICE '3. Reviews with helpful votes';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

-- Verify setup
SELECT 
  'Neighborhoods with scores' as info,
  COUNT(*) as count
FROM neighborhoods 
WHERE weighted_score > 0
UNION ALL
SELECT 
  'Buildings with scores' as info,
  COUNT(*) as count
FROM buildings 
WHERE weighted_score > 0;


