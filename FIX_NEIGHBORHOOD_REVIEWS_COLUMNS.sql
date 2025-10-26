-- Fix neighborhood_reviews table to match the frontend expectations
-- Run this in your Supabase SQL Editor

-- Add missing columns to neighborhood_reviews
ALTER TABLE neighborhood_reviews 
ADD COLUMN IF NOT EXISTS safety INTEGER CHECK (safety BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS noise INTEGER CHECK (noise BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS community INTEGER CHECK (community BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS transit INTEGER CHECK (transit BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS amenities INTEGER CHECK (amenities BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'neighborhood_reviews'
ORDER BY ordinal_position;
