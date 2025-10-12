-- ============================================
-- ADD SEO-FRIENDLY SLUGS TO DATABASE
-- Run this to improve your URLs
-- ============================================

-- Add slug columns to neighborhoods table
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS slug VARCHAR(500) UNIQUE;

-- Add slug columns to buildings table
ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS slug VARCHAR(500) UNIQUE;

-- Function to generate slug from name and city
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, city TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        name || '-' || city,
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing neighborhoods with slugs
UPDATE neighborhoods
SET slug = generate_slug(name, city)
WHERE slug IS NULL;

-- Update existing buildings with slugs
UPDATE buildings
SET slug = generate_slug(name, city)
WHERE slug IS NULL;

-- Add index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_buildings_slug ON buildings(slug);

-- ============================================
-- ✅ DONE!
-- 
-- Your URLs will now be:
-- OLD: /neighborhood/76411096-b348-45fb-897f-c7728db953ee
-- NEW: /neighborhood/king-george-surrey
-- 
-- Much better for SEO! 🚀
-- ============================================

