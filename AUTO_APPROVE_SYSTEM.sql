-- 🎯 AUTO-APPROVAL SYSTEM FOR RATINGS
-- Good ratings (3+) auto-approved
-- Low ratings (2 or less) require admin review

-- ============================================
-- STEP 1: Add status column if not exists
-- ============================================
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================
-- STEP 2: Create auto-approval function for neighborhoods
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_neighborhood_review()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  -- Calculate average rating for this review
  avg_rating := (NEW.safety + NEW.cleanliness + NEW.noise + NEW.community + NEW.transit + NEW.amenities) / 6.0;
  
  -- If rating is 3 or higher, auto-approve
  IF avg_rating >= 3.0 THEN
    NEW.status := 'approved';
    NEW.approved_at := NOW();
    NEW.approved_by := NEW.user_id; -- Self-approved (system)
  ELSE
    -- If rating is 2 or less, needs admin approval
    NEW.status := 'pending';
    NEW.approved_at := NULL;
    NEW.approved_by := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for neighborhood reviews
DROP TRIGGER IF EXISTS auto_approve_neighborhood_trigger ON neighborhood_reviews;
CREATE TRIGGER auto_approve_neighborhood_trigger
  BEFORE INSERT OR UPDATE ON neighborhood_reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_neighborhood_review();

-- ============================================
-- STEP 3: Create auto-approval function for buildings
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_building_review()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  -- Calculate average rating for this review
  avg_rating := (NEW.management + NEW.cleanliness + NEW.maintenance + NEW.rent_value + NEW.noise + NEW.amenities) / 6.0;
  
  -- If rating is 3 or higher, auto-approve
  IF avg_rating >= 3.0 THEN
    NEW.status := 'approved';
    NEW.approved_at := NOW();
    NEW.approved_by := NEW.user_id; -- Self-approved (system)
  ELSE
    -- If rating is 2 or less, needs admin approval
    NEW.status := 'pending';
    NEW.approved_at := NULL;
    NEW.approved_by := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for building reviews
DROP TRIGGER IF EXISTS auto_approve_building_trigger ON building_reviews;
CREATE TRIGGER auto_approve_building_trigger
  BEFORE INSERT OR UPDATE ON building_reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_building_review();

-- ============================================
-- STEP 4: Update existing reviews based on rating
-- ============================================

-- Auto-approve existing neighborhood reviews with 3+ stars
UPDATE neighborhood_reviews
SET 
  status = 'approved',
  approved_at = NOW(),
  approved_by = user_id
WHERE (safety + cleanliness + noise + community + transit + amenities) / 6.0 >= 3.0
  AND (status IS NULL OR status = 'pending');

-- Set pending for low neighborhood reviews
UPDATE neighborhood_reviews
SET 
  status = 'pending',
  approved_at = NULL,
  approved_by = NULL
WHERE (safety + cleanliness + noise + community + transit + amenities) / 6.0 < 3.0
  AND (status IS NULL OR status = 'approved');

-- Auto-approve existing building reviews with 3+ stars
UPDATE building_reviews
SET 
  status = 'approved',
  approved_at = NOW(),
  approved_by = user_id
WHERE (management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0 >= 3.0
  AND (status IS NULL OR status = 'pending');

-- Set pending for low building reviews
UPDATE building_reviews
SET 
  status = 'pending',
  approved_at = NULL,
  approved_by = NULL
WHERE (management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0 < 3.0
  AND (status IS NULL OR status = 'approved');

-- ============================================
-- STEP 5: Update stats functions to only count approved reviews
-- ============================================

-- Update neighborhood stats function
CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE neighborhoods
  SET 
    average_rating = (
      SELECT ROUND(AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0), 2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
      AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
      AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Update building stats function
CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buildings
  SET 
    average_rating = (
      SELECT ROUND(AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0), 2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
      AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
      AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 6: Verification
-- ============================================
SELECT '📊 Review Status Summary:' as info;

SELECT 
  'Neighborhood Reviews' as type,
  status,
  COUNT(*) as count,
  ROUND(AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0), 2) as avg_rating
FROM neighborhood_reviews
GROUP BY status;

SELECT 
  'Building Reviews' as type,
  status,
  COUNT(*) as count,
  ROUND(AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0), 2) as avg_rating
FROM building_reviews
GROUP BY status;

-- ============================================
-- ✅ DONE!
-- ============================================
-- Now when users submit reviews:
-- • 3+ stars = Auto-approved ✅
-- • 2 or less = Pending admin review ⏳
-- • Stats only count approved reviews
-- • Admins can approve/reject from admin panel
-- ============================================
