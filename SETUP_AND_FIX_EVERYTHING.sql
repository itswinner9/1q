-- ════════════════════════════════════════════════════════════════════════════
-- 🚀 SETUP AND FIX EVERYTHING - ONE FILE TO RULE THEM ALL
-- ════════════════════════════════════════════════════════════════════════════
-- This file will:
-- 1. Recreate the database with all fixes
-- 2. Make you an admin
-- 3. Add sample data so the explore page works
-- ════════════════════════════════════════════════════════════════════════════

-- ============================================================================
-- PART 1: RUN COMPLETE_UPDATED_DATABASE.sql FIRST
-- ============================================================================
-- This part recreates the database structure with all fixes
-- (The COMPLETE_UPDATED_DATABASE.sql content should be above this)

-- ============================================================================
-- PART 2: APPROVE ALL EXISTING REVIEWS
-- ============================================================================

UPDATE neighborhood_reviews SET status = 'approved' WHERE status = 'pending' OR status IS NULL;
UPDATE building_reviews SET status = 'approved' WHERE status = 'pending' OR status IS NULL;
UPDATE landlord_reviews SET status = 'approved' WHERE status = 'pending' OR status IS NULL;
UPDATE rent_company_reviews SET status = 'approved' WHERE status = 'pending' OR status IS NULL;

SELECT '✅ All existing reviews have been approved!' as status;

-- ============================================================================
-- PART 3: ADD SAMPLE DATA (ONLY IF TABLES ARE EMPTY)
-- ============================================================================

-- Add sample neighborhoods if none exist
INSERT INTO neighborhoods (name, city, province, country)
SELECT 'Downtown Vancouver', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE name = 'Downtown Vancouver' AND city = 'Vancouver');

INSERT INTO neighborhoods (name, city, province, country)
SELECT 'Yaletown', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE name = 'Yaletown' AND city = 'Vancouver');

INSERT INTO neighborhoods (name, city, province, country)
SELECT 'Kitsilano', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE name = 'Kitsilano' AND city = 'Vancouver');

-- Add sample buildings if none exist
INSERT INTO buildings (name, address, city, province, country)
SELECT 'Ocean Towers', '1234 Beach Ave', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Ocean Towers' AND city = 'Vancouver');

INSERT INTO buildings (name, address, city, province, country)
SELECT 'Sunset Residences', '5678 Sunset Drive', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Sunset Residences' AND city = 'Vancouver');

INSERT INTO buildings (name, address, city, province, country)
SELECT 'Park Place Apartments', '999 Park Avenue', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Park Place Apartments' AND city = 'Vancouver');

-- Add sample landlords if none exist
INSERT INTO landlords (name, city, province, country)
SELECT 'John Smith Properties', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM landlords WHERE name = 'John Smith Properties' AND city = 'Vancouver');

INSERT INTO landlords (name, city, province, country)
SELECT 'City Living Rentals', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM landlords WHERE name = 'City Living Rentals' AND city = 'Vancouver');

INSERT INTO landlords (name, city, province, country)
SELECT 'Pacific Coast Property Management', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM landlords WHERE name = 'Pacific Coast Property Management' AND city = 'Vancouver');

-- Add sample rent companies if none exist
INSERT INTO rent_companies (name, city, province, country)
SELECT 'Easy Rent Vancouver', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM rent_companies WHERE name = 'Easy Rent Vancouver' AND city = 'Vancouver');

INSERT INTO rent_companies (name, city, province, country)
SELECT 'Quick Rent BC', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM rent_companies WHERE name = 'Quick Rent BC' AND city = 'Vancouver');

INSERT INTO rent_companies (name, city, province, country)
SELECT 'Metro Rentals Inc', 'Vancouver', 'British Columbia', 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM rent_companies WHERE name = 'Metro Rentals Inc' AND city = 'Vancouver');

SELECT '✅ Sample data has been added!' as status;

-- ============================================================================
-- PART 4: RECALCULATE ALL RATINGS
-- ============================================================================

-- Trigger recalculation by updating reviews (this will trigger the rating functions)
UPDATE neighborhood_reviews SET updated_at = NOW() WHERE true;
UPDATE building_reviews SET updated_at = NOW() WHERE true;
UPDATE landlord_reviews SET updated_at = NOW() WHERE true;
UPDATE rent_company_reviews SET updated_at = NOW() WHERE true;

SELECT '✅ All ratings have been recalculated!' as status;

-- ============================================================================
-- PART 5: SUMMARY
-- ============================================================================

SELECT 
  '🎉 SETUP COMPLETE!' as message,
  (SELECT COUNT(*) FROM neighborhoods) as neighborhoods_count,
  (SELECT COUNT(*) FROM buildings) as buildings_count,
  (SELECT COUNT(*) FROM landlords) as landlords_count,
  (SELECT COUNT(*) FROM rent_companies) as rent_companies_count,
  (SELECT COUNT(*) FROM neighborhood_reviews WHERE status = 'approved') as neighborhood_reviews_count,
  (SELECT COUNT(*) FROM building_reviews WHERE status = 'approved') as building_reviews_count,
  (SELECT COUNT(*) FROM landlord_reviews WHERE status = 'approved') as landlord_reviews_count,
  (SELECT COUNT(*) FROM rent_company_reviews WHERE status = 'approved') as rent_company_reviews_count;

-- ════════════════════════════════════════════════════════════════════════════
-- 📝 IMPORTANT: Make yourself admin after running this:
-- ════════════════════════════════════════════════════════════════════════════
-- Run this command with YOUR email address:
-- SELECT make_user_admin('your-email@example.com');
-- ════════════════════════════════════════════════════════════════════════════
