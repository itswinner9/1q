-- Add anonymous feature to existing tables
-- Run this if you already have the tables

ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

ALTER TABLE building_reviews 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Update existing reviews to be anonymous by default
UPDATE neighborhood_reviews SET is_anonymous = true WHERE is_anonymous IS NULL;
UPDATE building_reviews SET is_anonymous = true WHERE is_anonymous IS NULL;

