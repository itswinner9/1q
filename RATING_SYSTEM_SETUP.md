# Rating System Setup - Complete Guide

## Step 1: Set Up Database (Run in Supabase SQL Editor)

Copy and run this SQL in your Supabase SQL Editor:

```sql
-- Complete Database Setup
-- This creates all tables needed for the rating system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if any
DROP TABLE IF EXISTS neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS building_reviews CASCADE;
DROP TABLE IF EXISTS landlord_reviews CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS landlords CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neighborhoods table
CREATE TABLE neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  slug TEXT UNIQUE,
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings table
CREATE TABLE buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  slug TEXT UNIQUE,
  cover_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Landlords table
CREATE TABLE landlords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  description TEXT,
  profile_image TEXT,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neighborhood reviews table
CREATE TABLE neighborhood_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  review TEXT NOT NULL DEFAULT 'No review text provided',
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
  transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  display_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

-- Building reviews table
CREATE TABLE building_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  review TEXT NOT NULL DEFAULT 'No review text provided',
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  display_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, user_id)
);

-- Landlord reviews table
CREATE TABLE landlord_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  landlord_id UUID REFERENCES landlords(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  review TEXT NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  responsiveness INTEGER NOT NULL CHECK (responsiveness >= 1 AND responsiveness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  communication INTEGER NOT NULL CHECK (communication >= 1 AND communication <= 5),
  fairness INTEGER NOT NULL CHECK (fairness >= 1 AND fairness <= 5),
  professionalism INTEGER NOT NULL CHECK (professionalism >= 1 AND professionalism <= 5),
  images TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  display_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(landlord_id, user_id)
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update neighborhood stats
CREATE OR REPLACE FUNCTION update_neighborhood_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE neighborhoods
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(overall_rating)::numeric, 2), 0.0)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
      AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM neighborhood_reviews
      WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id)
      AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for neighborhood reviews
DROP TRIGGER IF EXISTS neighborhood_review_stats ON neighborhood_reviews;
CREATE TRIGGER neighborhood_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
  FOR EACH ROW EXECUTE FUNCTION update_neighborhood_stats();

-- Function to update building stats
CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buildings
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(overall_rating)::numeric, 2), 0.0)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
      AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM building_reviews
      WHERE building_id = COALESCE(NEW.building_id, OLD.building_id)
      AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.building_id, OLD.building_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for building reviews
DROP TRIGGER IF EXISTS building_review_stats ON building_reviews;
CREATE TRIGGER building_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON building_reviews
  FOR EACH ROW EXECUTE FUNCTION update_building_stats();

-- Function to update landlord stats
CREATE OR REPLACE FUNCTION update_landlord_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE landlords
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(overall_rating)::numeric, 2), 0.0)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
      AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM landlord_reviews
      WHERE landlord_id = COALESCE(NEW.landlord_id, OLD.landlord_id)
      AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.landlord_id, OLD.landlord_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for landlord reviews
DROP TRIGGER IF EXISTS landlord_review_stats ON landlord_reviews;
CREATE TRIGGER landlord_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON landlord_reviews
  FOR EACH ROW EXECUTE FUNCTION update_landlord_stats();

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for neighborhoods (public read, authenticated write)
CREATE POLICY "Anyone can view neighborhoods" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create neighborhoods" ON neighborhoods FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update neighborhoods" ON neighborhoods FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for buildings (public read, authenticated write)
CREATE POLICY "Anyone can view buildings" ON buildings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create buildings" ON buildings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update buildings" ON buildings FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for landlords (public read, authenticated write)
CREATE POLICY "Anyone can view landlords" ON landlords FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create landlords" ON landlords FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update landlords" ON landlords FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for neighborhood_reviews
CREATE POLICY "Anyone can view approved neighborhood reviews" ON neighborhood_reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create neighborhood reviews" ON neighborhood_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own neighborhood reviews" ON neighborhood_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own neighborhood reviews" ON neighborhood_reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for building_reviews
CREATE POLICY "Anyone can view approved building reviews" ON building_reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create building reviews" ON building_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own building reviews" ON building_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own building reviews" ON building_reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for landlord_reviews
CREATE POLICY "Anyone can view approved landlord reviews" ON landlord_reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create landlord reviews" ON landlord_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own landlord reviews" ON landlord_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own landlord reviews" ON landlord_reviews FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX idx_buildings_slug ON buildings(slug);
CREATE INDEX idx_neighborhood_reviews_neighborhood_id ON neighborhood_reviews(neighborhood_id);
CREATE INDEX idx_neighborhood_reviews_status ON neighborhood_reviews(status);
CREATE INDEX idx_building_reviews_building_id ON building_reviews(building_id);
CREATE INDEX idx_building_reviews_status ON building_reviews(status);
CREATE INDEX idx_landlord_reviews_landlord_id ON landlord_reviews(landlord_id);
CREATE INDEX idx_landlord_reviews_status ON landlord_reviews(status);
```

## Step 2: Set Up Storage Buckets (Run in Supabase Storage)

1. Go to Supabase Dashboard → Storage
2. Create these buckets (if they don't exist):
   - `building-images` (Public)
   - `neighborhood-images` (Public)
   - `landlord-images` (Public)

3. For each bucket, set these policies:

**Insert Policy:**
```sql
(bucket_id = 'building-images' AND auth.role() = 'authenticated')
```

**Select Policy:**
```sql
(bucket_id = 'building-images')
```

**Update Policy:**
```sql
(bucket_id = 'building-images' AND auth.role() = 'authenticated')
```

**Delete Policy:**
```sql
(bucket_id = 'building-images' AND auth.role() = 'authenticated')
```

Repeat for `neighborhood-images` and `landlord-images` buckets.

## Step 3: Test the System

### Test User Registration and Login

1. Go to `/signup` and create a test account
2. Check that user profile is created automatically
3. Login at `/login`

### Test Rating a Building

1. Click "Rate" in navigation
2. Select "Apartment/Building"
3. Use the search to find an address
4. Fill all rating stars (all 6 categories)
5. Add optional comment and images
6. Submit

Expected behavior:
- If rating is 3+ stars: Approved automatically, visible immediately
- If rating is 1-2 stars: Pending admin review

### Test Rating a Neighborhood

1. Click "Rate" in navigation
2. Select "Neighborhood"
3. Use the search to find a neighborhood
4. Fill all rating stars (all 6 categories)
5. Add optional comment
6. Submit

Expected behavior:
- All neighborhood reviews go to pending for admin approval

## Step 4: User Instructions (Share with Users)

### How to Rate a Building or Neighborhood

1. **Sign Up or Login**
   - Go to LivRank.com
   - Click "Login" or "Sign Up" in top right
   - Create account with email and password

2. **Start Rating**
   - Click "Rate" button in navigation
   - Choose "Building" or "Neighborhood"

3. **Search for Location**
   - Use the search bar to find your address
   - It will auto-fill all fields (city, province, etc.)
   - You can edit if needed

4. **Rate All Categories**
   - Click stars for each category (1-5 stars)
   - 1 star = Very Poor
   - 5 stars = Excellent
   - Must rate ALL categories

5. **Add Your Experience (Optional)**
   - Write a comment explaining your ratings
   - Upload photos (up to 5 images)

6. **Choose Privacy**
   - Post Anonymously (default)
   - Or show your name

7. **Submit**
   - Click "Submit Rating"
   - High ratings (3+ stars) are approved instantly
   - Low ratings need admin review

## Common Issues and Fixes

### Issue: "Not authenticated" error
**Fix:** Make sure you're logged in. Go to `/login` first.

### Issue: "Must rate all categories"
**Fix:** Click stars for ALL 6 rating categories. All must be filled.

### Issue: Image upload fails
**Fix:** Check that storage buckets are created and public.

### Issue: Review not showing up
**Fix:** Low ratings (1-2 stars) need admin approval. Check admin panel at `/admin`.

### Issue: Duplicate location error
**Fix:** The system auto-detects duplicates. It will add your review to existing location.

## Admin Features

Admins can:
- View all pending reviews at `/admin/pending`
- Approve or reject reviews
- Ban users at `/admin/users`
- View all reviews at `/admin/all-reviews`

## Database Schema Overview

- **user_profiles**: User accounts and admin status
- **neighborhoods**: Neighborhood locations and ratings
- **buildings**: Building locations and ratings
- **landlords**: Landlord information and ratings
- **neighborhood_reviews**: User reviews of neighborhoods
- **building_reviews**: User reviews of buildings
- **landlord_reviews**: User reviews of landlords

Each review table has:
- 6 category ratings (1-5 stars)
- overall_rating (calculated automatically)
- status (pending/approved/rejected)
- Anonymous option
- Images support

## Success Indicators

The rating system is working 100% when:

1. Users can create accounts easily
2. Search autocomplete works for addresses
3. All 6 stars can be clicked and saved
4. Images upload successfully
5. Reviews with 3+ stars show immediately
6. Reviews with 1-2 stars go to pending
7. Admins can approve/reject reviews
8. No duplicate locations are created
9. Average ratings calculate automatically
10. Users can update their own reviews

## Need Help?

If something isn't working:
1. Check browser console for errors (F12)
2. Check Supabase logs in dashboard
3. Verify all SQL was run successfully
4. Confirm storage buckets exist and are public
5. Test with a fresh user account
