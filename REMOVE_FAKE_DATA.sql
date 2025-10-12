-- ============================================
-- DELETE ALL FAKE/TEST DATA
-- Run this to remove test data and start fresh
-- ============================================

-- Delete all neighborhoods with NULL user_id (test data)
DELETE FROM neighborhoods WHERE user_id IS NULL;

-- Delete all buildings with NULL user_id (test data)
DELETE FROM buildings WHERE user_id IS NULL;

-- Also delete the specific test entries by name (in case they have a user_id)
DELETE FROM neighborhoods WHERE name IN (
  'Liberty Village',
  'Downtown', 
  'The Annex',
  'Yorkville',
  'Yaletown',
  'Gastown'
);

DELETE FROM buildings WHERE name IN (
  'The Grand Tower',
  'Maple Leaf Apartments',
  'Lakeshore Condos',
  'City View Towers',
  'Vancouver Central',
  'Seaside Residences'
);

-- ============================================
-- DONE! All fake data removed!
-- Now only REAL user ratings will show
-- ============================================

