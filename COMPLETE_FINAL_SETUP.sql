-- ═══════════════════════════════════════════════════════════════
-- COMPLETE FINAL SETUP - Everything You Need
-- ═══════════════════════════════════════════════════════════════
-- Copy ALL of this and paste in Supabase SQL Editor, then RUN
-- This includes: Tables, RLS, Triggers, Algorithms, Everything!
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Clean up - Drop everything
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_neighborhood_stats() CASCADE;
DROP FUNCTION IF EXISTS update_building_stats() CASCADE;
DROP FUNCTION IF EXISTS calculate_weighted_score(DECIMAL, INTEGER, INTEGER) CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- PART 1: USER PROFILES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON user_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Sync existing users
INSERT INTO user_profiles (id, email, full_name, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Set admin users
UPDATE user_profiles 
SET is_admin = true 
WHERE email IN ('ophelia7067@tiffincrane.com', '25luise@tiffincrane.com');

-- ═══════════════════════════════════════════════════════════════
-- PART 2: NEIGHBORHOODS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  cover_image TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  weighted_score DECIMAL DEFAULT 0,
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city, province)
);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view neighborhoods" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create neighborhoods" ON neighborhoods FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update neighborhoods" ON neighborhoods FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE INDEX idx_neighborhoods_weighted_score ON neighborhoods(weighted_score DESC);
CREATE INDEX idx_neighborhoods_average_rating ON neighborhoods(average_rating DESC);

-- ═══════════════════════════════════════════════════════════════
-- PART 3: BUILDINGS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  cover_image TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  weighted_score DECIMAL DEFAULT 0,
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(address, city)
);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view buildings" ON buildings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create buildings" ON buildings FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update buildings" ON buildings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE INDEX idx_buildings_weighted_score ON buildings(weighted_score DESC);
CREATE INDEX idx_buildings_average_rating ON buildings(average_rating DESC);

-- ═══════════════════════════════════════════════════════════════
-- PART 4: NEIGHBORHOOD REVIEWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE neighborhood_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
  transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON neighborhood_reviews FOR SELECT
  USING (status = 'approved');
CREATE POLICY "Users can view own reviews" ON neighborhood_reviews FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reviews" ON neighborhood_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Authenticated users can create reviews" ON neighborhood_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own reviews" ON neighborhood_reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all reviews" ON neighborhood_reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Users can delete own reviews" ON neighborhood_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 5: BUILDING REVIEWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE building_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, user_id)
);

ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON building_reviews FOR SELECT
  USING (status = 'approved');
CREATE POLICY "Users can view own reviews" ON building_reviews FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reviews" ON building_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Authenticated users can create reviews" ON building_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own reviews" ON building_reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all reviews" ON building_reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Users can delete own reviews" ON building_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 6: REVIEW VOTES (Like/Dislike System)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  review_id UUID NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('neighborhood', 'building')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_id, review_type)
);

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON review_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON review_votes FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_review_votes_lookup ON review_votes(user_id, review_id, review_type);

-- ═══════════════════════════════════════════════════════════════
-- PART 7: AUTO-UPDATE TRIGGERS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL;
  new_count INTEGER;
BEGIN
  SELECT 
    AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0),
    COUNT(*)
  INTO new_avg, new_count
  FROM neighborhood_reviews
  WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
    AND status = 'approved';

  UPDATE neighborhoods
  SET 
    average_rating = COALESCE(new_avg, 0),
    total_reviews = COALESCE(new_count, 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_neighborhood_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_neighborhood_stats();

CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL;
  new_count INTEGER;
BEGIN
  SELECT 
    AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0),
    COUNT(*)
  INTO new_avg, new_count
  FROM building_reviews
  WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
    AND status = 'approved';

  UPDATE buildings
  SET 
    average_rating = COALESCE(new_avg, 0),
    total_reviews = COALESCE(new_count, 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_building_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_building_stats();

-- ═══════════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═══════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ COMPLETE SETUP SUCCESSFUL!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ RLS enabled with proper policies';
  RAISE NOTICE '✅ Auto-profile trigger active';
  RAISE NOTICE '✅ Rating calculation triggers active';
  RAISE NOTICE '✅ Like/dislike system ready';
  RAISE NOTICE '✅ Admin user set: ophelia7067@tiffincrane.com';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '1. Login to your account';
  RAISE NOTICE '2. Rate neighborhoods and buildings';
  RAISE NOTICE '3. Like/dislike reviews';
  RAISE NOTICE '4. Use admin panel';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

-- Verify setup
SELECT 
  'user_profiles' as table_name, 
  COUNT(*)::int as rows,
  (SELECT COUNT(*)::int FROM user_profiles WHERE is_admin = true) as admins
FROM user_profiles
UNION ALL
SELECT 'neighborhoods', COUNT(*)::int, 0 FROM neighborhoods
UNION ALL
SELECT 'buildings', COUNT(*)::int, 0 FROM buildings
UNION ALL
SELECT 'neighborhood_reviews', COUNT(*)::int, 0 FROM neighborhood_reviews
UNION ALL
SELECT 'building_reviews', COUNT(*)::int, 0 FROM building_reviews
UNION ALL
SELECT 'review_votes', COUNT(*)::int, 0 FROM review_votes;

