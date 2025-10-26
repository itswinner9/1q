-- Fix missing slug columns in all main tables
-- Run this in your Supabase SQL Editor

-- Add slug columns to all main tables
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE landlords 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE rent_companies 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing records with slugs
UPDATE neighborhoods 
SET slug = generate_slug(name || '-' || city || '-' || province)
WHERE slug IS NULL;

UPDATE buildings 
SET slug = generate_slug(name || '-' || city || '-' || province)
WHERE slug IS NULL;

UPDATE landlords 
SET slug = generate_slug(name || '-' || city || '-' || province)
WHERE slug IS NULL;

UPDATE rent_companies 
SET slug = generate_slug(name || '-' || city || '-' || province)
WHERE slug IS NULL;

-- Create unique indexes on slug columns
CREATE UNIQUE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_buildings_slug ON buildings(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_landlords_slug ON landlords(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rent_companies_slug ON rent_companies(slug);

-- Create function to ensure unique slugs
CREATE OR REPLACE FUNCTION ensure_unique_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug
  base_slug := generate_slug(NEW.name || '-' || NEW.city || '-' || NEW.province);
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (
    SELECT 1 FROM neighborhoods WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) OR EXISTS (
    SELECT 1 FROM buildings WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) OR EXISTS (
    SELECT 1 FROM landlords WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) OR EXISTS (
    SELECT 1 FROM rent_companies WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-generate slugs
DROP TRIGGER IF EXISTS ensure_neighborhood_slug ON neighborhoods;
CREATE TRIGGER ensure_neighborhood_slug
  BEFORE INSERT OR UPDATE ON neighborhoods
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION ensure_unique_slug();

DROP TRIGGER IF EXISTS ensure_building_slug ON buildings;
CREATE TRIGGER ensure_building_slug
  BEFORE INSERT OR UPDATE ON buildings
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION ensure_unique_slug();

DROP TRIGGER IF EXISTS ensure_landlord_slug ON landlords;
CREATE TRIGGER ensure_landlord_slug
  BEFORE INSERT OR UPDATE ON landlords
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION ensure_unique_slug();

DROP TRIGGER IF EXISTS ensure_rent_company_slug ON rent_companies;
CREATE TRIGGER ensure_rent_company_slug
  BEFORE INSERT OR UPDATE ON rent_companies
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION ensure_unique_slug();

-- Verify the fix
SELECT 'neighborhoods' as table_name, COUNT(*) as total, COUNT(slug) as with_slug
FROM neighborhoods
UNION ALL
SELECT 'buildings' as table_name, COUNT(*) as total, COUNT(slug) as with_slug
FROM buildings
UNION ALL
SELECT 'landlords' as table_name, COUNT(*) as total, COUNT(slug) as with_slug
FROM landlords
UNION ALL
SELECT 'rent_companies' as table_name, COUNT(*) as total, COUNT(slug) as with_slug
FROM rent_companies;
