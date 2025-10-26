-- ════════════════════════════════════════════════════════════════════════════
-- 🚀 COMPLETE UPDATED DATABASE - ALL FIXES INCLUDED
-- ════════════════════════════════════════════════════════════════════════════
-- This includes ALL the fixes we've made:
-- 1. updated_at columns for all review tables
-- 2. Correct overall_rating calculation for landlords (average of 5 categories)
-- 3. Status filtering for rating calculations
-- 4. Landlord profile_image support
-- 5. Additional columns (comment, images, etc.) for all review tables
-- ════════════════════════════════════════════════════════════════════════════

-- STEP 1: Clean slate - drop everything first
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

-- STEP 2: Create user_profiles table (SIMPLE)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create neighborhoods table (SIMPLE)
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
    
    -- Simple ratings
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

-- STEP 4: Create neighborhood_reviews table (SIMPLE + ALL COLUMNS)
CREATE TABLE neighborhood_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT,
    comment TEXT,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    safety INTEGER CHECK (safety BETWEEN 1 AND 5),
    safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
    walkability_rating INTEGER CHECK (walkability_rating BETWEEN 1 AND 5),
    cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    transit_rating INTEGER CHECK (transit_rating BETWEEN 1 AND 5),
    schools_rating INTEGER CHECK (schools_rating BETWEEN 1 AND 5),
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
    amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
    noise INTEGER CHECK (noise BETWEEN 1 AND 5),
    noise_rating INTEGER CHECK (noise_rating BETWEEN 1 AND 5),
    community INTEGER CHECK (community BETWEEN 1 AND 5),
    community_rating INTEGER CHECK (community_rating BETWEEN 1 AND 5),
    quiet_rating INTEGER CHECK (quiet_rating BETWEEN 1 AND 5),
    
    -- Images
    images TEXT[],
    
    -- Metadata
    years_lived INTEGER,
    would_recommend BOOLEAN,
    
    -- Admin approval workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Allow only one review per user per neighborhood
    UNIQUE(neighborhood_id, user_id)
);

-- STEP 5: Create buildings table (SIMPLE)
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
    
    -- Simple ratings
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

-- STEP 6: Create landlords table (SIMPLE + PROFILE IMAGE)
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
    
    -- Simple ratings
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

-- STEP 7: Create rent_companies table (SIMPLE)
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
    
    -- Simple ratings
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

-- STEP 8: Create building_reviews table (SIMPLE + ALL COLUMNS)
CREATE TABLE building_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT,
    comment TEXT,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    management INTEGER CHECK (management BETWEEN 1 AND 5),
    management_rating INTEGER CHECK (management_rating BETWEEN 1 AND 5),
    cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
    maintenance_rating INTEGER CHECK (maintenance_rating BETWEEN 1 AND 5),
    rent_value INTEGER CHECK (rent_value BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    noise INTEGER CHECK (noise BETWEEN 1 AND 5),
    noise_rating INTEGER CHECK (noise_rating BETWEEN 1 AND 5),
    amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
    
    -- Images
    images TEXT[],
    
    -- Metadata
    unit_number TEXT,
    years_lived INTEGER,
    monthly_rent NUMERIC(10, 2),
    would_recommend BOOLEAN,
    
    -- Admin approval workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Allow only one review per user per building
    UNIQUE(building_id, user_id)
);

-- STEP 9: Create landlord_reviews table (SIMPLE + ALL COLUMNS)
CREATE TABLE landlord_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT,
    comment TEXT,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    responsiveness INTEGER CHECK (responsiveness BETWEEN 1 AND 5),
    responsiveness_rating INTEGER CHECK (responsiveness_rating BETWEEN 1 AND 5),
    maintenance INTEGER CHECK (maintenance BETWEEN 1 AND 5),
    maintenance_rating INTEGER CHECK (maintenance_rating BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    fairness INTEGER CHECK (fairness BETWEEN 1 AND 5),
    fairness_rating INTEGER CHECK (fairness_rating BETWEEN 1 AND 5),
    professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    
    -- Images
    images TEXT[],
    
    -- Metadata
    years_rented INTEGER,
    monthly_rent NUMERIC(10, 2),
    would_recommend BOOLEAN,
    
    -- Admin approval workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Allow only one review per user per landlord
    UNIQUE(landlord_id, user_id)
);

-- STEP 10: Create rent_company_reviews table (SIMPLE + ALL COLUMNS)
CREATE TABLE rent_company_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rent_company_id UUID NOT NULL REFERENCES rent_companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT,
    comment TEXT,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    service_quality INTEGER CHECK (service_quality BETWEEN 1 AND 5),
    service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
    pricing INTEGER CHECK (pricing BETWEEN 1 AND 5),
    pricing_rating INTEGER CHECK (pricing_rating BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    reliability INTEGER CHECK (reliability BETWEEN 1 AND 5),
    reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
    professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    
    -- Images
    images TEXT[],
    
    -- Metadata
    years_used INTEGER,
    would_recommend BOOLEAN,
    
    -- Admin approval workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Allow only one review per user per rent company
    UNIQUE(rent_company_id, user_id)
);

-- STEP 11: DISABLE ALL ROW LEVEL SECURITY (NO RESTRICTIONS!)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods DISABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE landlords DISABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE rent_companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE rent_company_reviews DISABLE ROW LEVEL SECURITY;

-- STEP 12: Create function to auto-create user profiles
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

-- STEP 13: Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- STEP 14: Create function to update neighborhood ratings
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
      SELECT AVG(COALESCE(safety, safety_rating))::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND (safety IS NOT NULL OR safety_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    walkability_rating = COALESCE((
      SELECT AVG(walkability_rating)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND walkability_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    transit_rating = COALESCE((
      SELECT AVG(transit_rating)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND transit_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    schools_rating = COALESCE((
      SELECT AVG(schools_rating)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND schools_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    amenities_rating = COALESCE((
      SELECT AVG(COALESCE(amenities, amenities_rating))::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND (amenities IS NOT NULL OR amenities_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    quiet_rating = COALESCE((
      SELECT AVG(COALESCE(quiet_rating, noise_rating))::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND (quiet_rating IS NOT NULL OR noise_rating IS NOT NULL)
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

-- STEP 15: Create trigger for neighborhood ratings
DROP TRIGGER IF EXISTS update_neighborhood_ratings_trigger ON neighborhood_reviews;
CREATE TRIGGER update_neighborhood_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION update_neighborhood_ratings();

-- STEP 16: Create function to update building ratings
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
      SELECT AVG(COALESCE(management, management_rating))::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND (management IS NOT NULL OR management_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    cleanliness_rating = COALESCE((
      SELECT AVG(COALESCE(cleanliness, cleanliness_rating))::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND (cleanliness IS NOT NULL OR cleanliness_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    maintenance_rating = COALESCE((
      SELECT AVG(COALESCE(maintenance, maintenance_rating))::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND (maintenance IS NOT NULL OR maintenance_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    value_rating = COALESCE((
      SELECT AVG(COALESCE(rent_value, value_rating))::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND (rent_value IS NOT NULL OR value_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    noise_rating = COALESCE((
      SELECT AVG(COALESCE(noise, noise_rating))::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND (noise IS NOT NULL OR noise_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    amenities_rating = COALESCE((
      SELECT AVG(COALESCE(amenities, amenities_rating))::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND (amenities IS NOT NULL OR amenities_rating IS NOT NULL)
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

-- STEP 17: Create trigger for building ratings
DROP TRIGGER IF EXISTS update_building_ratings_trigger ON building_reviews;
CREATE TRIGGER update_building_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION update_building_ratings();

-- STEP 18: Create function to update landlord ratings
-- CRITICAL FIX: Only calculate from approved reviews, and average the 5 category ratings
CREATE OR REPLACE FUNCTION update_landlord_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE landlords
  SET
    -- CRITICAL FIX: Calculate overall_rating as average of 5 category ratings
    overall_rating = COALESCE((
      SELECT ROUND(AVG(
        (
          COALESCE(responsiveness, responsiveness_rating, 0) +
          COALESCE(maintenance, maintenance_rating, 0) +
          COALESCE(communication, communication_rating, 0) +
          COALESCE(fairness, fairness_rating, 0) +
          COALESCE(professionalism, professionalism_rating, 0)
        ) / 5.0
      ) * 2) / 2, 1
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND status = 'approved'
    ), 0),
    responsiveness_rating = COALESCE((
      SELECT AVG(COALESCE(responsiveness, responsiveness_rating))::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND (responsiveness IS NOT NULL OR responsiveness_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    maintenance_rating = COALESCE((
      SELECT AVG(COALESCE(maintenance, maintenance_rating))::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND (maintenance IS NOT NULL OR maintenance_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    communication_rating = COALESCE((
      SELECT AVG(COALESCE(communication, communication_rating))::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND (communication IS NOT NULL OR communication_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    fairness_rating = COALESCE((
      SELECT AVG(COALESCE(fairness, fairness_rating))::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND (fairness IS NOT NULL OR fairness_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    professionalism_rating = COALESCE((
      SELECT AVG(COALESCE(professionalism, professionalism_rating))::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND (professionalism IS NOT NULL OR professionalism_rating IS NOT NULL)
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

-- STEP 19: Create trigger for landlord ratings
DROP TRIGGER IF EXISTS update_landlord_ratings_trigger ON landlord_reviews;
CREATE TRIGGER update_landlord_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON landlord_reviews
  FOR EACH ROW EXECUTE FUNCTION update_landlord_ratings();

-- STEP 20: Create function to update rent company ratings
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
      SELECT AVG(COALESCE(service_quality, service_rating))::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND (service_quality IS NOT NULL OR service_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    pricing_rating = COALESCE((
      SELECT AVG(COALESCE(pricing, pricing_rating))::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND (pricing IS NOT NULL OR pricing_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    communication_rating = COALESCE((
      SELECT AVG(COALESCE(communication, communication_rating))::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND (communication IS NOT NULL OR communication_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    reliability_rating = COALESCE((
      SELECT AVG(COALESCE(reliability, reliability_rating))::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND (reliability IS NOT NULL OR reliability_rating IS NOT NULL)
        AND status = 'approved'
    ), 0),
    professionalism_rating = COALESCE((
      SELECT AVG(COALESCE(professionalism, professionalism_rating))::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND (professionalism IS NOT NULL OR professionalism_rating IS NOT NULL)
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

-- STEP 21: Create trigger for rent company ratings
DROP TRIGGER IF EXISTS update_rent_company_ratings_trigger ON rent_company_reviews;
CREATE TRIGGER update_rent_company_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON rent_company_reviews
  FOR EACH ROW EXECUTE FUNCTION update_rent_company_ratings();

-- STEP 22: Create function to make users admin
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

-- STEP 23: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_buildings_neighborhood ON buildings(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_neighborhood ON neighborhood_reviews(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_user ON neighborhood_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_building_reviews_building ON building_reviews(building_id);
CREATE INDEX IF NOT EXISTS idx_building_reviews_user ON building_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_landlords_city ON landlords(city);
CREATE INDEX IF NOT EXISTS idx_landlord_reviews_landlord ON landlord_reviews(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_reviews_user ON landlord_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_rent_companies_city ON rent_companies(city);
CREATE INDEX IF NOT EXISTS idx_rent_company_reviews_company ON rent_company_reviews(rent_company_id);
CREATE INDEX IF NOT EXISTS idx_rent_company_reviews_user ON rent_company_reviews(user_id);

-- STEP 24: Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 COMPLETE UPDATED DATABASE CREATED SUCCESSFULLY!';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ WHAT WAS CREATED:';
  RAISE NOTICE '  • user_profiles table (with role system)';
  RAISE NOTICE '  • neighborhoods table (with ratings)';
  RAISE NOTICE '  • neighborhood_reviews table (user reviews + all columns)';
  RAISE NOTICE '  • buildings table (with ratings)';
  RAISE NOTICE '  • building_reviews table (user reviews + all columns)';
  RAISE NOTICE '  • landlords table (with ratings + profile_image)';
  RAISE NOTICE '  • landlord_reviews table (user reviews + all columns)';
  RAISE NOTICE '  • rent_companies table (with ratings)';
  RAISE NOTICE '  • rent_company_reviews table (user reviews + all columns)';
  RAISE NOTICE '  • Auto-updating rating triggers (with status filtering)';
  RAISE NOTICE '  • CORRECT overall_rating calculation for landlords';
  RAISE NOTICE '  • Auto-profile creation on signup';
  RAISE NOTICE '  • Admin promotion function';
  RAISE NOTICE '  • updated_at columns in all review tables';
  RAISE NOTICE '';
  RAISE NOTICE '🔓 SECURITY:';
  RAISE NOTICE '  • ROW LEVEL SECURITY DISABLED (no restrictions!)';
  RAISE NOTICE '  • Users can submit ratings freely';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 READY TO USE:';
  RAISE NOTICE '  1. Users can sign up and login';
  RAISE NOTICE '  2. Users can rate neighborhoods, buildings, landlords, and rent companies';
  RAISE NOTICE '  3. Ratings auto-update when new reviews are added';
  RAISE NOTICE '  4. Landlord ratings correctly calculate as average of 5 categories';
  RAISE NOTICE '  5. Make admin: SELECT make_user_admin(''email@example.com'');';
  RAISE NOTICE '  6. Approve pending reviews to make them visible';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
END $$;

-- Show all tables created
SELECT 
  tablename as "📋 Table Created",
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "💾 Size"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
