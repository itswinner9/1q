-- Fix the generate_slug function conflict
-- Run this in your Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS generate_slug(text);

-- Create the new function with correct parameter name
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

-- Now add the missing slug columns
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE landlords 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE rent_companies 
ADD COLUMN IF NOT EXISTS slug TEXT;

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
