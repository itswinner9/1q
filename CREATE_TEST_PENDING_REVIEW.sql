-- 🧪 CREATE TEST PENDING REVIEW
-- This creates a test low-rating review that needs admin approval

-- First, make sure you have a neighborhood to review
INSERT INTO neighborhoods (name, city, province, latitude, longitude, slug)
VALUES ('Test Neighborhood', 'Surrey', 'BC', 49.1913, -122.8490, 'test-neighborhood-surrey')
ON CONFLICT (name, city, province) DO NOTHING
RETURNING id;

-- Get the neighborhood ID (replace with actual ID from above)
-- Then create a test low rating that will be pending

-- If you're logged in, get your user ID from:
SELECT id, email FROM auth.users WHERE email = 'tami76@tiffincrane.com';

-- Create a test pending review (replace USER_ID and NEIGHBORHOOD_ID)
-- Example:
-- INSERT INTO neighborhood_reviews (
--   neighborhood_id, user_id, 
--   safety, cleanliness, noise, community, transit, amenities,
--   comment, status
-- ) VALUES (
--   'NEIGHBORHOOD_ID_HERE',
--   'USER_ID_HERE',
--   1, 1, 1, 1, 1, 1,
--   'This is a test low rating that needs approval',
--   'pending'
-- );

-- ✅ Or check if you have any pending reviews:
SELECT 
  'Pending Neighborhood Reviews:' as info,
  nr.id,
  n.name,
  n.city,
  (nr.safety + nr.cleanliness + nr.noise + nr.community + nr.transit + nr.amenities) / 6.0 as avg_rating,
  nr.status,
  nr.created_at
FROM neighborhood_reviews nr
JOIN neighborhoods n ON nr.neighborhood_id = n.id
WHERE nr.status = 'pending'
ORDER BY nr.created_at DESC;

SELECT 
  'Pending Building Reviews:' as info,
  br.id,
  b.name,
  b.city,
  (br.management + br.cleanliness + br.maintenance + br.rent_value + br.noise + br.amenities) / 6.0 as avg_rating,
  br.status,
  br.created_at
FROM building_reviews br
JOIN buildings b ON br.building_id = b.id
WHERE br.status = 'pending'
ORDER BY br.created_at DESC;

-- ✅ If you see reviews above, they should appear in /admin/pending
