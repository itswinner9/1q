# 🔍 Database Check & Fix Guide

## Why Nothing Shows Up

If you see "No neighborhoods found" and "No buildings found", it means:

1. **Database tables don't exist yet**, OR
2. **Database is empty** (no ratings submitted yet)

Let me help you fix this!

---

## Step 1: Check If Tables Exist

### Go to Supabase Dashboard:
1. Visit https://app.supabase.com
2. Open your project: `tqxomrvaiaidblwdvonu`
3. Click **"Table Editor"** in left sidebar

### You Should See:
- `neighborhoods` table
- `buildings` table

### If You DON'T See Them:
**→ You need to create the tables!** Follow Step 2 below.

### If You DO See Them:
**→ Tables exist but are empty.** Skip to Step 3.

---

## Step 2: Create Database Tables

### Go to SQL Editor:
1. In Supabase, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Copy and paste this COMPLETE SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
  transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  average_rating DECIMAL(3,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
  rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
  noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
  amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
  average_rating DECIMAL(3,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_user ON neighborhoods(user_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_buildings_user ON buildings(user_id);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);

-- Enable Row Level Security
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Neighborhoods are viewable by everyone" ON neighborhoods;
DROP POLICY IF EXISTS "Users can insert their own neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Users can update their own neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Users can delete their own neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Buildings are viewable by everyone" ON buildings;
DROP POLICY IF EXISTS "Users can insert their own buildings" ON buildings;
DROP POLICY IF EXISTS "Users can update their own buildings" ON buildings;
DROP POLICY IF EXISTS "Users can delete their own buildings" ON buildings;

-- Create policies for neighborhoods
CREATE POLICY "Neighborhoods are viewable by everyone" 
  ON neighborhoods FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own neighborhoods" 
  ON neighborhoods FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own neighborhoods" 
  ON neighborhoods FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own neighborhoods" 
  ON neighborhoods FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for buildings
CREATE POLICY "Buildings are viewable by everyone" 
  ON buildings FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own buildings" 
  ON buildings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buildings" 
  ON buildings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buildings" 
  ON buildings FOR DELETE 
  USING (auth.uid() = user_id);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for "Success" message

---

## Step 3: Add Test Data (To See Results)

Since your database is probably empty, let's add some test data so you can see it working!

### In SQL Editor, run this:

```sql
-- First, get a user ID (we'll use the first user, or create a dummy one)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to get an existing user
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, use a dummy UUID (you'll need to actually sign up first)
  IF test_user_id IS NULL THEN
    test_user_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  -- Insert test neighborhoods
  INSERT INTO neighborhoods (name, city, province, user_id, safety, cleanliness, noise, community, transit, amenities, average_rating, images)
  VALUES
    ('Liberty Village', 'Toronto', 'Ontario', test_user_id, 5, 4, 3, 5, 5, 4, 4.33, ARRAY[]::TEXT[]),
    ('Downtown', 'Toronto', 'Ontario', test_user_id, 4, 4, 2, 4, 5, 5, 4.00, ARRAY[]::TEXT[]),
    ('The Annex', 'Toronto', 'Ontario', test_user_id, 5, 5, 4, 5, 4, 4, 4.50, ARRAY[]::TEXT[]),
    ('Yorkville', 'Toronto', 'Ontario', test_user_id, 5, 5, 3, 4, 5, 5, 4.50, ARRAY[]::TEXT[]),
    ('Yaletown', 'Vancouver', 'British Columbia', test_user_id, 4, 5, 3, 4, 4, 5, 4.17, ARRAY[]::TEXT[]),
    ('Gastown', 'Vancouver', 'British Columbia', test_user_id, 3, 3, 4, 4, 5, 4, 3.83, ARRAY[]::TEXT[])
  ON CONFLICT DO NOTHING;

  -- Insert test buildings
  INSERT INTO buildings (name, address, city, province, user_id, management, cleanliness, maintenance, rent_value, noise, amenities, average_rating, images)
  VALUES
    ('The Grand Tower', '100 Queens Quay West', 'Toronto', 'Ontario', test_user_id, 5, 5, 4, 4, 4, 5, 4.50, ARRAY[]::TEXT[]),
    ('Maple Leaf Apartments', '123 King Street West', 'Toronto', 'Ontario', test_user_id, 4, 4, 4, 3, 3, 4, 3.67, ARRAY[]::TEXT[]),
    ('Lakeshore Condos', '55 Harbour Square', 'Toronto', 'Ontario', test_user_id, 5, 5, 5, 4, 4, 5, 4.67, ARRAY[]::TEXT[]),
    ('City View Towers', '1 Bloor Street East', 'Toronto', 'Ontario', test_user_id, 4, 4, 3, 3, 3, 4, 3.50, ARRAY[]::TEXT[]),
    ('Vancouver Central', '789 Burrard Street', 'Vancouver', 'British Columbia', test_user_id, 5, 4, 4, 4, 4, 5, 4.33, ARRAY[]::TEXT[]),
    ('Seaside Residences', '456 Beach Avenue', 'Vancouver', 'British Columbia', test_user_id, 5, 5, 5, 5, 5, 5, 5.00, ARRAY[]::TEXT[])
  ON CONFLICT DO NOTHING;
END $$;
```

Click **"Run"**

---

## Step 4: Verify Data

### Check Table Editor:
1. Click **"Table Editor"** in Supabase
2. Click **"neighborhoods"** table
3. You should see 6 neighborhoods!
4. Click **"buildings"** table
5. You should see 6 buildings!

---

## Step 5: Refresh Your App

1. Go to http://localhost:3000
2. **Press F12** to open browser console
3. **Refresh the page** (Cmd+R or Ctrl+R)
4. Look in console for:
   ```
   Fetched neighborhoods: 6
   Fetched buildings: 6
   ```

### You Should Now See:
✅ Top Rated Neighborhoods section with 6 cards
✅ Top Rated Buildings section with 6 cards
✅ Search autocomplete working
✅ Explore page showing all ratings

---

## Troubleshooting

### Still Showing "No neighborhoods found"?

**Check Console:**
1. Press F12
2. Look for errors in red
3. Look for "Fetched neighborhoods: X"

**Common Issues:**

**Issue 1: "relation neighborhoods does not exist"**
```
Solution: Run the SQL from Step 2 to create tables
```

**Issue 2: "Fetched neighborhoods: 0"**
```
Solution: Run the SQL from Step 3 to add test data
```

**Issue 3: Red errors in console**
```
Solution: 
1. Check .env.local has correct Supabase URL and key
2. Restart dev server
3. Refresh browser
```

**Issue 4: "permission denied for table neighborhoods"**
```
Solution: Run the policies SQL again (Step 2)
Make sure policies allow SELECT to public
```

---

## Quick Test After Setup

### Test 1: Check Homepage
```bash
# Open: http://localhost:3000
# Should see: 6 neighborhoods and 6 buildings
# Console should show: "Fetched neighborhoods: 6"
```

### Test 2: Check Explore
```bash
# Open: http://localhost:3000/explore
# Should see: All ratings listed
# Try searching for "Liberty"
# Should see: Liberty Village in results
```

### Test 3: Check Search Autocomplete
```bash
# Type: "Liberty" in search bar
# Should see: Suggestions dropdown with "Liberty Village, Toronto"
# Click it or press Enter
# Should see: Filtered results
```

---

## 🎯 Expected Results After Setup

### Homepage:
- ✅ 6 neighborhoods in "Top Rated Neighborhoods"
- ✅ 6 buildings in "Top Rated Buildings"
- ✅ Each with rating score
- ✅ Search autocomplete working

### Explore Page:
- ✅ All neighborhoods listed
- ✅ All buildings listed
- ✅ Search and filter working
- ✅ Click cards to view details

### Console:
```
Fetched neighborhoods: 6
Fetched buildings: 6
```

---

## 🚀 Next Steps

Once you can see the test data:

1. **Sign up for an account**
2. **Rate a real neighborhood**
3. **Upload photos**
4. **See it appear instantly**
5. **Check your profile**
6. **See stats update**

---

## 📞 Still Having Issues?

### Check These:

1. **Supabase Connection**
   ```bash
   # Check .env.local exists
   cat /Users/sakamuse/Documents/ratemy/.env.local
   
   # Should show:
   # NEXT_PUBLIC_SUPABASE_URL=https://tqxomrvaiaidblwdvonu.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

2. **Browser Console (F12)**
   - Check for red errors
   - Look for "Fetched neighborhoods: X"
   - Check network tab for failed requests

3. **Supabase Dashboard**
   - Table Editor → Should see tables
   - Check data is there
   - Authentication → Should allow email signup

---

## ✅ Once Working

You should see:
- Test neighborhoods on homepage
- Test buildings on homepage
- All data in explore
- Search autocomplete with suggestions
- Can click cards to view details

Then you can:
- Add your own real ratings
- Upload photos
- See everything work perfectly!

---

**Follow these steps and your data will show up!** 🎉

