-- ═══════════════════════════════════════════════════════════════
-- LIVRANK - COMPLETE DATABASE SETUP
-- ═══════════════════════════════════════════════════════════════
-- Reddit-style review platform for buildings, neighborhoods, landlords
-- With slug-based URLs, discussions, and full SEO optimization
-- ═══════════════════════════════════════════════════════════════

-- Drop existing tables (be careful!)
DROP TABLE IF EXISTS discussion_votes CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS landlords CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- PART 1: USER PROFILES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════
-- PART 2: NEIGHBORHOODS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city, province)
);

CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);

-- RLS for neighborhoods
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view neighborhoods" ON neighborhoods
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create neighborhoods" ON neighborhoods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update neighborhoods" ON neighborhoods
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ═══════════════════════════════════════════════════════════════
-- PART 3: LANDLORDS (Must come before buildings!)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE landlords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  company_name TEXT,
  website TEXT,
  phone TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_buildings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_landlords_slug ON landlords(slug);
CREATE INDEX idx_landlords_rating ON landlords(average_rating DESC);

-- RLS for landlords
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view landlords" ON landlords
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create landlords" ON landlords
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update landlords" ON landlords
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ═══════════════════════════════════════════════════════════════
-- PART 4: BUILDINGS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
  landlord_id UUID REFERENCES landlords(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(address, city, province)
);

CREATE INDEX idx_buildings_slug ON buildings(slug);
CREATE INDEX idx_buildings_neighborhood ON buildings(neighborhood_id);
CREATE INDEX idx_buildings_landlord ON buildings(landlord_id);
CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);

-- RLS for buildings
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view buildings" ON buildings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create buildings" ON buildings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update buildings" ON buildings
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ═══════════════════════════════════════════════════════════════
-- PART 5: NEIGHBORHOOD REVIEWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE neighborhood_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  safety INTEGER CHECK (safety BETWEEN 1 AND 5) NOT NULL,
  cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5) NOT NULL,
  noise INTEGER CHECK (noise BETWEEN 1 AND 5) NOT NULL,
  community INTEGER CHECK (community BETWEEN 1 AND 5) NOT NULL,
  transit INTEGER CHECK (transit BETWEEN 1 AND 5) NOT NULL,
  amenities INTEGER CHECK (amenities BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_neighborhood_reviews_neighborhood ON neighborhood_reviews(neighborhood_id);
CREATE INDEX idx_neighborhood_reviews_user ON neighborhood_reviews(user_id);
CREATE INDEX idx_neighborhood_reviews_status ON neighborhood_reviews(status);

-- RLS for neighborhood_reviews
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved neighborhood reviews" ON neighborhood_reviews
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create neighborhood reviews" ON neighborhood_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own neighborhood reviews" ON neighborhood_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own neighborhood reviews" ON neighborhood_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 6: BUILDING REVIEWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE building_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  management INTEGER CHECK (management BETWEEN 1 AND 5) NOT NULL,
  cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5) NOT NULL,
  maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5) NOT NULL,
  rent_value INTEGER CHECK (rent_value BETWEEN 1 AND 5) NOT NULL,
  noise INTEGER CHECK (noise BETWEEN 1 AND 5) NOT NULL,
  amenities INTEGER CHECK (amenities BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_building_reviews_building ON building_reviews(building_id);
CREATE INDEX idx_building_reviews_user ON building_reviews(user_id);
CREATE INDEX idx_building_reviews_status ON building_reviews(status);

-- RLS for building_reviews
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved building reviews" ON building_reviews
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create building reviews" ON building_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own building reviews" ON building_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own building reviews" ON building_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 7: REVIEW VOTES (For helpful/not helpful)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  review_id UUID NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('neighborhood', 'building')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_id, review_type)
);

CREATE INDEX idx_review_votes_review ON review_votes(review_id, review_type);
CREATE INDEX idx_review_votes_user ON review_votes(user_id);

-- RLS for review_votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all review votes" ON review_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON review_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 8: DISCUSSIONS (Reddit-style threads)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  body TEXT NOT NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES landlords(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (building_id IS NOT NULL AND neighborhood_id IS NULL AND landlord_id IS NULL) OR
    (building_id IS NULL AND neighborhood_id IS NOT NULL AND landlord_id IS NULL) OR
    (building_id IS NULL AND neighborhood_id IS NULL AND landlord_id IS NOT NULL)
  )
);

CREATE INDEX idx_discussions_building ON discussions(building_id);
CREATE INDEX idx_discussions_neighborhood ON discussions(neighborhood_id);
CREATE INDEX idx_discussions_landlord ON discussions(landlord_id);
CREATE INDEX idx_discussions_parent ON discussions(parent_id);
CREATE INDEX idx_discussions_user ON discussions(user_id);
CREATE INDEX idx_discussions_status ON discussions(status);
CREATE INDEX idx_discussions_score ON discussions((upvotes - downvotes) DESC);

-- RLS for discussions
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved discussions" ON discussions
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create discussions" ON discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussions" ON discussions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussions" ON discussions
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 9: DISCUSSION VOTES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE discussion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, discussion_id)
);

CREATE INDEX idx_discussion_votes_discussion ON discussion_votes(discussion_id);
CREATE INDEX idx_discussion_votes_user ON discussion_votes(user_id);

-- RLS for discussion_votes
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all discussion votes" ON discussion_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on discussions" ON discussion_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussion votes" ON discussion_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussion votes" ON discussion_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 10: TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.created_at
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sync existing users
INSERT INTO user_profiles (id, email, full_name, created_at)
SELECT 
  id, 
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Auto-update neighborhood ratings
CREATE OR REPLACE FUNCTION update_neighborhood_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE neighborhoods
  SET 
    average_rating = (
      SELECT AVG((safety + cleanliness + noise + community + transit + amenities) / 6.0)
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

DROP TRIGGER IF EXISTS update_neighborhood_ratings_trigger ON neighborhood_reviews;
CREATE TRIGGER update_neighborhood_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION update_neighborhood_ratings();

-- Auto-update building ratings
CREATE OR REPLACE FUNCTION update_building_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buildings
  SET 
    average_rating = (
      SELECT AVG((management + cleanliness + maintenance + rent_value + noise + amenities) / 6.0)
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

DROP TRIGGER IF EXISTS update_building_ratings_trigger ON building_reviews;
CREATE TRIGGER update_building_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION update_building_ratings();

-- Auto-generate slugs
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(text_input, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═══════════════════════════════════════════════════════════════
-- PART 11: SET ADMINS
-- ═══════════════════════════════════════════════════════════════

UPDATE user_profiles 
SET is_admin = true 
WHERE email IN ('ophelia7067@tiffincrane.com', '25luise@tiffincrane.com');

-- ═══════════════════════════════════════════════════════════════
-- DONE!
-- ═══════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ LIVRANK DATABASE COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '✅ User profiles with admin system';
  RAISE NOTICE '✅ Neighborhoods with slug support';
  RAISE NOTICE '✅ Buildings with slug support';
  RAISE NOTICE '✅ Landlords with slug support';
  RAISE NOTICE '✅ Reviews for neighborhoods & buildings';
  RAISE NOTICE '✅ Reddit-style discussions';
  RAISE NOTICE '✅ Voting system (upvote/downvote)';
  RAISE NOTICE '✅ RLS policies for security';
  RAISE NOTICE '✅ Auto-rating calculation triggers';
  RAISE NOTICE '✅ Slug generation function';
  RAISE NOTICE '';
  RAISE NOTICE 'Admins set:';
  RAISE NOTICE '- ophelia7067@tiffincrane.com';
  RAISE NOTICE '- 25luise@tiffincrane.com';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

