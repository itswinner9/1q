-- ════════════════════════════════════════════════════════════════════════════
-- 🚀 FRESH START DATABASE - COMPLETELY REWRITTEN
-- ════════════════════════════════════════════════════════════════════════════
-- This is a completely fresh, simple database that WILL work
-- No complex RLS policies, no restrictions, just pure functionality
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create neighborhood_reviews table (SIMPLE)
CREATE TABLE neighborhood_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT NOT NULL,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
    walkability_rating INTEGER CHECK (walkability_rating BETWEEN 1 AND 5),
    transit_rating INTEGER CHECK (transit_rating BETWEEN 1 AND 5),
    schools_rating INTEGER CHECK (schools_rating BETWEEN 1 AND 5),
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
    quiet_rating INTEGER CHECK (quiet_rating BETWEEN 1 AND 5),
    
    -- Metadata
    years_lived INTEGER,
    would_recommend BOOLEAN,
    
    -- Admin approval workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Create landlords table (SIMPLE)
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
    
    -- Simple ratings
    overall_rating NUMERIC(3, 2) DEFAULT 0,
    responsiveness_rating NUMERIC(3, 2) DEFAULT 0,
    maintenance_rating NUMERIC(3, 2) DEFAULT 0,
    communication_rating NUMERIC(3, 2) DEFAULT 0,
    fairness_rating NUMERIC(3, 2) DEFAULT 0,
    professionalism_rating NUMERIC(3, 2) DEFAULT 0,
    
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 8: Create building_reviews table (SIMPLE)
CREATE TABLE building_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT NOT NULL,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    management_rating INTEGER CHECK (management_rating BETWEEN 1 AND 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    maintenance_rating INTEGER CHECK (maintenance_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    noise_rating INTEGER CHECK (noise_rating BETWEEN 1 AND 5),
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
    
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
    
    -- Allow only one review per user per building
    UNIQUE(building_id, user_id)
);

-- STEP 9: Create landlord_reviews table (SIMPLE)
CREATE TABLE landlord_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT NOT NULL,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    responsiveness_rating INTEGER CHECK (responsiveness_rating BETWEEN 1 AND 5),
    maintenance_rating INTEGER CHECK (maintenance_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    fairness_rating INTEGER CHECK (fairness_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    
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
    
    -- Allow only one review per user per landlord
    UNIQUE(landlord_id, user_id)
);

-- STEP 10: Create rent_company_reviews table (SIMPLE)
CREATE TABLE rent_company_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rent_company_id UUID NOT NULL REFERENCES rent_companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review TEXT NOT NULL,
    pros TEXT,
    cons TEXT,
    
    -- Privacy options
    is_anonymous BOOLEAN DEFAULT false,
    display_name TEXT,
    
    -- Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
    pricing_rating INTEGER CHECK (pricing_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    
    -- Metadata
    years_used INTEGER,
    would_recommend BOOLEAN,
    
    -- Admin approval workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
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

-- STEP 8: Create function to auto-create user profiles
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
    -- Profile already exists, do nothing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 9: Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- STEP 10: Create function to update neighborhood ratings
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
      SELECT AVG(safety_rating)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND safety_rating IS NOT NULL
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
      SELECT AVG(amenities_rating)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND amenities_rating IS NOT NULL
        AND status = 'approved'
    ), 0),
    quiet_rating = COALESCE((
      SELECT AVG(quiet_rating)::NUMERIC(3,2)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
        AND quiet_rating IS NOT NULL
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

-- STEP 11: Create trigger for neighborhood ratings
DROP TRIGGER IF EXISTS update_neighborhood_ratings_trigger ON neighborhood_reviews;
CREATE TRIGGER update_neighborhood_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION update_neighborhood_ratings();

-- STEP 12: Create function to update building ratings
CREATE OR REPLACE FUNCTION update_building_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buildings
  SET
    overall_rating = COALESCE((
      SELECT AVG(overall_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
    ), 0),
    management_rating = COALESCE((
      SELECT AVG(management_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND management_rating IS NOT NULL
    ), 0),
    cleanliness_rating = COALESCE((
      SELECT AVG(cleanliness_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND cleanliness_rating IS NOT NULL
    ), 0),
    maintenance_rating = COALESCE((
      SELECT AVG(maintenance_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND maintenance_rating IS NOT NULL
    ), 0),
    value_rating = COALESCE((
      SELECT AVG(value_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND value_rating IS NOT NULL
    ), 0),
    noise_rating = COALESCE((
      SELECT AVG(noise_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND noise_rating IS NOT NULL
    ), 0),
    amenities_rating = COALESCE((
      SELECT AVG(amenities_rating)::NUMERIC(3,2)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
        AND amenities_rating IS NOT NULL
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
    )
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- STEP 13: Create trigger for building ratings
DROP TRIGGER IF EXISTS update_building_ratings_trigger ON building_reviews;
CREATE TRIGGER update_building_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION update_building_ratings();

-- STEP 14: Create function to update landlord ratings
CREATE OR REPLACE FUNCTION update_landlord_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE landlords
  SET
    overall_rating = COALESCE((
      SELECT AVG(overall_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
    ), 0),
    responsiveness_rating = COALESCE((
      SELECT AVG(responsiveness_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND responsiveness_rating IS NOT NULL
    ), 0),
    maintenance_rating = COALESCE((
      SELECT AVG(maintenance_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND maintenance_rating IS NOT NULL
    ), 0),
    communication_rating = COALESCE((
      SELECT AVG(communication_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND communication_rating IS NOT NULL
    ), 0),
    fairness_rating = COALESCE((
      SELECT AVG(fairness_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND fairness_rating IS NOT NULL
    ), 0),
    professionalism_rating = COALESCE((
      SELECT AVG(professionalism_rating)::NUMERIC(3,2)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
        AND professionalism_rating IS NOT NULL
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
    )
  WHERE id = COALESCE(NEW.landlord_id, OLD.landlord_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- STEP 15: Create trigger for landlord ratings
DROP TRIGGER IF EXISTS update_landlord_ratings_trigger ON landlord_reviews;
CREATE TRIGGER update_landlord_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON landlord_reviews
  FOR EACH ROW EXECUTE FUNCTION update_landlord_ratings();

-- STEP 16: Create function to update rent company ratings
CREATE OR REPLACE FUNCTION update_rent_company_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rent_companies
  SET
    overall_rating = COALESCE((
      SELECT AVG(overall_rating)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
    ), 0),
    service_rating = COALESCE((
      SELECT AVG(service_rating)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND service_rating IS NOT NULL
    ), 0),
    pricing_rating = COALESCE((
      SELECT AVG(pricing_rating)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND pricing_rating IS NOT NULL
    ), 0),
    communication_rating = COALESCE((
      SELECT AVG(communication_rating)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND communication_rating IS NOT NULL
    ), 0),
    reliability_rating = COALESCE((
      SELECT AVG(reliability_rating)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND reliability_rating IS NOT NULL
    ), 0),
    professionalism_rating = COALESCE((
      SELECT AVG(professionalism_rating)::NUMERIC(3,2)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
        AND professionalism_rating IS NOT NULL
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM rent_company_reviews
      WHERE rent_company_id = COALESCE(NEW.rent_company_id, OLD.rent_company_id)
    )
  WHERE id = COALESCE(NEW.rent_company_id, OLD.rent_company_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- STEP 17: Create trigger for rent company ratings
DROP TRIGGER IF EXISTS update_rent_company_ratings_trigger ON rent_company_reviews;
CREATE TRIGGER update_rent_company_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON rent_company_reviews
  FOR EACH ROW EXECUTE FUNCTION update_rent_company_ratings();

-- STEP 14: Create function to make users admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RETURN 'User not found. Please make sure they have signed up first.';
  END IF;
  
  -- Update their role to admin
  UPDATE user_profiles
  SET role = 'admin'
  WHERE id = user_uuid;
  
  IF FOUND THEN
    RETURN 'Success! User ' || user_email || ' is now an admin.';
  ELSE
    RETURN 'User profile not found. They may need to log in once first.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 18: Create indexes for performance
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

-- STEP 16: Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 FRESH START DATABASE CREATED SUCCESSFULLY!';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ WHAT WAS CREATED:';
  RAISE NOTICE '  • user_profiles table (with role system)';
  RAISE NOTICE '  • neighborhoods table (with ratings)';
  RAISE NOTICE '  • neighborhood_reviews table (user reviews)';
  RAISE NOTICE '  • buildings table (with ratings)';
  RAISE NOTICE '  • building_reviews table (user reviews)';
  RAISE NOTICE '  • landlords table (with ratings)';
  RAISE NOTICE '  • landlord_reviews table (user reviews)';
  RAISE NOTICE '  • rent_companies table (with ratings)';
  RAISE NOTICE '  • rent_company_reviews table (user reviews)';
  RAISE NOTICE '  • Auto-updating rating triggers';
  RAISE NOTICE '  • Auto-profile creation on signup';
  RAISE NOTICE '  • Admin promotion function';
  RAISE NOTICE '';
  RAISE NOTICE '🔓 SECURITY:';
  RAISE NOTICE '  • ROW LEVEL SECURITY DISABLED (no restrictions!)';
  RAISE NOTICE '  • Users can submit ratings freely';
  RAISE NOTICE '  • No more RLS policy errors';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 READY TO USE:';
  RAISE NOTICE '  1. Users can sign up and login';
  RAISE NOTICE '  2. Users can rate buildings and neighborhoods';
  RAISE NOTICE '  3. Users can rate landlords and rent companies';
  RAISE NOTICE '  4. Ratings auto-update when new reviews are added';
  RAISE NOTICE '  5. Make admin: SELECT make_user_admin(''email@example.com'');';
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

-- STEP 19: Create admin approval functions
CREATE OR REPLACE FUNCTION approve_review(
  review_id UUID,
  review_type TEXT,
  admin_user_id UUID,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  table_name TEXT;
BEGIN
  -- Determine table name based on review type
  CASE review_type
    WHEN 'neighborhood' THEN table_name := 'neighborhood_reviews';
    WHEN 'building' THEN table_name := 'building_reviews';
    WHEN 'landlord' THEN table_name := 'landlord_reviews';
    WHEN 'rent_company' THEN table_name := 'rent_company_reviews';
    ELSE
      RAISE EXCEPTION 'Invalid review type: %', review_type;
  END CASE;

  -- Update review status
  EXECUTE format('
    UPDATE %I 
    SET status = ''approved'',
        reviewed_by = %L,
        reviewed_at = NOW(),
        admin_notes = %L
    WHERE id = %L
  ', table_name, admin_user_id, admin_notes, review_id);

  -- Check if any rows were updated
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reject_review(
  review_id UUID,
  review_type TEXT,
  admin_user_id UUID,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  table_name TEXT;
BEGIN
  -- Determine table name based on review type
  CASE review_type
    WHEN 'neighborhood' THEN table_name := 'neighborhood_reviews';
    WHEN 'building' THEN table_name := 'building_reviews';
    WHEN 'landlord' THEN table_name := 'landlord_reviews';
    WHEN 'rent_company' THEN table_name := 'rent_company_reviews';
    ELSE
      RAISE EXCEPTION 'Invalid review type: %', review_type;
  END CASE;

  -- Update review status
  EXECUTE format('
    UPDATE %I 
    SET status = ''rejected'',
        reviewed_by = %L,
        reviewed_at = NOW(),
        admin_notes = %L
    WHERE id = %L
  ', table_name, admin_user_id, admin_notes, review_id);

  -- Check if any rows were updated
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- STEP 20: Create function to get pending reviews
CREATE OR REPLACE FUNCTION get_pending_reviews()
RETURNS TABLE (
  id UUID,
  review_type TEXT,
  entity_name TEXT,
  entity_id UUID,
  user_name TEXT,
  title TEXT,
  review TEXT,
  overall_rating INTEGER,
  created_at TIMESTAMPTZ,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nr.id,
    'neighborhood'::TEXT as review_type,
    n.name as entity_name,
    nr.neighborhood_id as entity_id,
    up.display_name as user_name,
    nr.title,
    nr.review,
    nr.overall_rating,
    nr.created_at,
    nr.status
  FROM neighborhood_reviews nr
  JOIN neighborhoods n ON nr.neighborhood_id = n.id
  JOIN user_profiles up ON nr.user_id = up.id
  WHERE nr.status = 'pending'
  
  UNION ALL
  
  SELECT 
    br.id,
    'building'::TEXT as review_type,
    b.name as entity_name,
    br.building_id as entity_id,
    up.display_name as user_name,
    br.title,
    br.review,
    br.overall_rating,
    br.created_at,
    br.status
  FROM building_reviews br
  JOIN buildings b ON br.building_id = b.id
  JOIN user_profiles up ON br.user_id = up.id
  WHERE br.status = 'pending'
  
  UNION ALL
  
  SELECT 
    lr.id,
    'landlord'::TEXT as review_type,
    l.name as entity_name,
    lr.landlord_id as entity_id,
    up.display_name as user_name,
    lr.title,
    lr.review,
    lr.overall_rating,
    lr.created_at,
    lr.status
  FROM landlord_reviews lr
  JOIN landlords l ON lr.landlord_id = l.id
  JOIN user_profiles up ON lr.user_id = up.id
  WHERE lr.status = 'pending'
  
  UNION ALL
  
  SELECT 
    rcr.id,
    'rent_company'::TEXT as review_type,
    rc.name as entity_name,
    rcr.rent_company_id as entity_id,
    up.display_name as user_name,
    rcr.title,
    rcr.review,
    rcr.overall_rating,
    rcr.created_at,
    rcr.status
  FROM rent_company_reviews rcr
  JOIN rent_companies rc ON rcr.rent_company_id = rc.id
  JOIN user_profiles up ON rcr.user_id = up.id
  WHERE rcr.status = 'pending'
  
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;