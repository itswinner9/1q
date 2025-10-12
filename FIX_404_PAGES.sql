-- 🔧 FIX 404 ISSUES - Generate slugs for all locations

-- ============================================
-- STEP 1: Add slug column if it doesn't exist
-- ============================================
ALTER TABLE neighborhoods ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS slug TEXT;

-- ============================================
-- STEP 2: Generate slugs for existing neighborhoods
-- ============================================
UPDATE neighborhoods
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name || '-' || city, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- ============================================
-- STEP 3: Generate slugs for existing buildings
-- ============================================
UPDATE buildings
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name || '-' || city, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- ============================================
-- STEP 4: Handle duplicate slugs
-- ============================================
-- Add unique suffix to duplicate neighborhood slugs
WITH duplicates AS (
  SELECT slug, 
         id,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM neighborhoods
  WHERE slug IS NOT NULL
)
UPDATE neighborhoods
SET slug = neighborhoods.slug || '-' || duplicates.rn
FROM duplicates
WHERE neighborhoods.id = duplicates.id 
  AND duplicates.rn > 1;

-- Add unique suffix to duplicate building slugs
WITH duplicates AS (
  SELECT slug, 
         id,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM buildings
  WHERE slug IS NOT NULL
)
UPDATE buildings
SET slug = buildings.slug || '-' || duplicates.rn
FROM duplicates
WHERE buildings.id = duplicates.id 
  AND duplicates.rn > 1;

-- ============================================
-- STEP 5: Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_buildings_slug ON buildings(slug);

-- ============================================
-- STEP 6: Verify results
-- ============================================
SELECT '✅ Neighborhoods with slugs:' as info, COUNT(*) as count FROM neighborhoods WHERE slug IS NOT NULL;
SELECT '✅ Buildings with slugs:' as info, COUNT(*) as count FROM buildings WHERE slug IS NOT NULL;

-- Show sample slugs
SELECT 'Sample neighborhood slugs:' as info, name, slug FROM neighborhoods LIMIT 5;
SELECT 'Sample building slugs:' as info, name, slug FROM buildings LIMIT 5;

-- ✅ DONE! All locations now have slugs and 404 errors should be fixed!
