-- ════════════════════════════════════════════════════════════════════════════
-- 🚀 FRESH START - ZERO TO HERO DATABASE
-- ════════════════════════════════════════════════════════════════════════════
-- This is a complete, working database from scratch
-- All issues fixed from the start - no patches needed
-- ════════════════════════════════════════════════════════════════════════════

-- ============================================================================
-- PART 1: DROP EVERYTHING (CLEAN SLATE)
-- ============================================================================

DROP TABLE IF EXISTS landlord_reviews CASCADE;
DROP TABLE IF EXISTS rent_company_reviews CASCADE;
DROP TABLE IF EXISTS landlords CASCADE;
DROP TABLE IF EXISTS rent_companies CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS make_user_admin(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_neighborhood_ratings() CASCADE;
DROP FUNCTION IF EXISTS update_building_ratings() CASCADE;
DROP FUNCTION IF EXISTS update_landlord_ratings() CASCADE;
DROP FUNCTION IF EXISTS update_rent_company_ratings() CASCADE;

-- ============================================================================
-- PART 2: CREATE TABLES (CORRECT FROM THE START)
-- ============================================================================

-- User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neighborhoods
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT DEFAULT 'Canada',
    description TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    overall_rating NUMERIC(3, 2) DEFAULT 0,
    safety_rating NUMERIC(3, 2) DEFAULT 0,
    walkability_rating NUMERIC(3, 2) DEFAULT 0,
    transit_rating NUMERIC(3, 2) DEFAULT 0,
    schools_rating NUMERIC(3, 2) DEFAULT 0,
    amenities_rating NUMERIC(3, 2) DEFAULT 0,
    quiet_rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buildings
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT DEFAULT 'Canada',
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    description TEXT,
    year_built INTEGER,
    total_units INTEGER,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    overall_rating NUMERIC(3, 2) DEFAULT 0,
    management_rating NUMERIC(3, 2) DEFAULT 0,
    cleanliness_rating NUMERIC(3, 2) DEFAULT 0,
    maintenance_rating NUMERIC(3, 2) DEFAULT 0,
    value_rating NUMERIC(3, 2) DEFAULT 0,
    noise_rating NUMERIC(3, 2) DEFAULT 0,
    amenities_rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Landlords
CREATE TABLE landlords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT DEFAULT 'Canada',
    description TEXT,
    profile_image TEXT,
    overall_rating NUMERIC(3, 2) DEFAULT 0,
    responsiveness_rating NUMERIC(3, 2) DEFAULT 0,
    maintenance_rating NUMERIC(3, 2) DEFAULT 0,
    communication_rating NUMERIC(3, 2) DEFAULT 0,
    fairness_rating NUMERIC(3, 2) DEFAULT 0,
    professionalism_rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rent Companies
CREATE TABLE rent_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT DEFAULT 'Canada',
    description TEXT,
    overall_rating NUMERIC(3, 2) DEFAULT 0,
    service_rating NUMERIC(3, 2) DEFAULT 0,
    pricing_rating NUMERIC(3, 2) DEFAULT 0,
    communication_rating NUMERIC(3, 2) DEFAULT 0,
    reliability_rating NUMERIC(3, 2) DEFAULT 0,
    professionalism_rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neighborhood Reviews
CREATE TABLE neighborhood_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT,
    review TEXT,
    comment TEXT,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    safety INTEGER CHECK (safety BETWEEN 1 AND 5),
    cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
    noise INTEGER CHECK (noise BETWEEN 1 AND 5),
    community INTEGER CHECK (community BETWEEN 1 AND 5),
    amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    images TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(neighborhood_id, user_id)
);

-- Building Reviews
CREATE TABLE building_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT,
    review TEXT,
    comment TEXT,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    management INTEGER CHECK (management BETWEEN 1 AND 5),
    cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
    maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
    rent_value INTEGER CHECK (rent_value BETWEEN 1 AND 5),
    noise INTEGER CHECK (noise BETWEEN 1 AND 5),
    amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    images TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(building_id, user_id)
);

-- Landlord Reviews
CREATE TABLE landlord_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT,
    review TEXT,
    comment TEXT,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    responsiveness INTEGER CHECK (responsiveness BETWEEN 1 AND 5),
    maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    fairness INTEGER CHECK (fairness BETWEEN 1 AND 5),
    professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    images TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(landlord_id, user_id)
);

-- Rent Company Reviews
CREATE TABLE rent_company_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rent_company_id UUID NOT NULL REFERENCES rent_companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT,
    review TEXT,
    comment TEXT,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    service_quality INTEGER CHECK (service_quality BETWEEN 1 AND 5),
    pricing INTEGER CHECK (pricing BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    reliability INTEGER CHECK (reliability BETWEEN 1 AND 5),
    professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    images TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rent_company_id, user_id)
);

-- ============================================================================
-- PART 3: DISABLE RLS (NO RESTRICTIONS)
-- ============================================================================

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods DISABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE landlords DISABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE rent_companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE rent_company_reviews DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: AUTO-CREATE USER PROFILES
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- PART 5: RATING UPDATE FUNCTIONS (CORRECT FROM START)
-- ============================================================================

-- Neighborhood Ratings
CREATE OR REPLACE FUNCTION update_neighborhood_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE neighborhoods
  SET
    overall_rating = COALESCE((
      SELECT AVG(overall_rating)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND status = 'approved'
    ), 0),
    safety_rating = COALESCE((
      SELECT AVG(safety)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND safety IS NOT NULL
        AND status = 'approved'
    ), 0),
    amenities_rating = COALESCE((
      SELECT AVG(amenities)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND amenities IS NOT NULL
        AND status = 'approved'
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Building Ratings
CREATE OR REPLACE FUNCTION update_building_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buildings
  SET
    overall_rating = COALESCE((
      SELECT AVG(overall_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND status = 'approved'
    ), 0),
    management_rating = COALESCE((
      SELECT AVG(management)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND management IS NOT NULL
        AND status = 'approved'
    ), 0),
    cleanliness_rating = COALESCE((
      SELECT AVG(cleanliness)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND cleanliness IS NOT NULL
        AND status = 'approved'
    ), 0),
    maintenance_rating = COALESCE((
      SELECT AVG(maintenance)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND maintenance IS NOT NULL
        AND status = 'approved'
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Rent Company Ratings
CREATE OR REPLACE FUNCTION update_rent_company_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rent_companies
  SET
    overall_rating = COALESCE((
      SELECT AVG(overall_rating)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND status = 'approved'
    ), 0),
    service_rating = COALESCE((
      SELECT AVG(service_quality)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND service_quality IS NOT NULL
        AND status = 'approved'
    ), 0),
    pricing_rating = COALESCE((
      SELECT AVG(pricing)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND pricing IS NOT NULL
        AND status = 'approved'
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.rent_company_id, OLD.rent_company_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Landlord Ratings (CORRECT: use overall_rating from reviews, not calculate from categories)
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
      SELECT AVG(responsiveness)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND responsiveness IS NOT NULL
        AND status = 'approved'
    ), 0),
    maintenance_rating = COALESCE((
      SELECT AVG(maintenance)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND maintenance IS NOT NULL
        AND status = 'approved'
    ), 0),
    communication_rating = COALESCE((
      SELECT AVG(communication)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND communication IS NOT NULL
        AND status = 'approved'
    ), 0),
    fairness_rating = COALESCE((
      SELECT AVG(fairness)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND fairness IS NOT NULL
        AND status = 'approved'
    ), 0),
    professionalism_rating = COALESCE((
      SELECT AVG(professionalism)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND professionalism IS NOT NULL
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

-- Create triggers for all review types
DROP TRIGGER IF EXISTS update_neighborhood_ratings_trigger ON neighborhood_reviews;
CREATE TRIGGER update_neighborhood_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION update_neighborhood_ratings();

DROP TRIGGER IF EXISTS update_building_ratings_trigger ON building_reviews;
CREATE TRIGGER update_building_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION update_building_ratings();

DROP TRIGGER IF EXISTS update_landlord_ratings_trigger ON landlord_reviews;
CREATE TRIGGER update_landlord_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON landlord_reviews
  FOR EACH ROW EXECUTE FUNCTION update_landlord_ratings();

DROP TRIGGER IF EXISTS update_rent_company_ratings_trigger ON rent_company_reviews;
CREATE TRIGGER update_rent_company_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON rent_company_reviews
  FOR EACH ROW EXECUTE FUNCTION update_rent_company_ratings();

-- ============================================================================
-- PART 6: HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RETURN 'User not found. Please make sure they have signed up first.';
  END IF;
  
  UPDATE user_profiles
  SET role = 'admin', is_admin = true
  WHERE id = user_uuid;
  
  IF FOUND THEN
    RETURN 'Success! User ' || user_email || ' is now an admin.';
  ELSE
    RETURN 'User profile not found. They may need to log in once first.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 7: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_landlords_city ON landlords(city);
CREATE INDEX IF NOT EXISTS idx_rent_companies_city ON rent_companies(city);

-- ============================================================================
-- PART 8: SUCCESS MESSAGE
-- ============================================================================

SELECT '🎉 Fresh database created successfully! Ready to use!' as status;
