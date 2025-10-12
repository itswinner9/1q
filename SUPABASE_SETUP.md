# Supabase Setup Guide

Follow these steps to set up your Supabase backend for NeighborhoodRank.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: NeighborhoodRank
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Create Database Tables

Go to the SQL Editor in your Supabase dashboard and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create neighborhoods table
CREATE TABLE neighborhoods (
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
CREATE TABLE buildings (
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

-- Create indexes for better query performance
CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
CREATE INDEX idx_neighborhoods_user ON neighborhoods(user_id);
CREATE INDEX idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);
CREATE INDEX idx_buildings_user ON buildings(user_id);
CREATE INDEX idx_buildings_name ON buildings(name);

-- Enable Row Level Security
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

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

Click "Run" to execute the SQL.

## Step 3: Set Up Storage Buckets

1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Create bucket named: `neighborhood-images`
   - Make it **Public**
4. Create another bucket named: `building-images`
   - Make it **Public**

### Configure Storage Policies

For each bucket, go to Policies and add these:

```sql
-- Allow public read access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'building-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'neighborhood-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'building-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'building-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'building-images');
```

## Step 4: Configure Authentication

1. Go to Authentication > Settings in Supabase dashboard
2. Configure Email Auth:
   - Enable Email provider
   - Disable "Confirm email" if you want to test without email confirmation (you can enable it later)
   - Or configure your email provider (e.g., SMTP) for production

3. Configure Site URL:
   - For development: `http://localhost:3000`
   - For production: Your actual domain

4. Configure Redirect URLs:
   - Add `http://localhost:3000/**` for development
   - Add your production URLs when deploying

## Step 5: Get Your API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy these values:
   - **Project URL**: Your Supabase project URL
   - **anon public**: Your anonymous/public API key

## Step 6: Update Your .env.local File

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase project URL and anon key.

## Step 7: Update next.config.js (Optional)

If you want to display uploaded images, update the domains in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project-ref.supabase.co'],
  },
}

module.exports = nextConfig
```

Replace `your-project-ref` with your actual Supabase project reference.

## Verification

To verify everything is set up correctly:

1. Start your development server: `npm run dev`
2. Try to sign up for an account
3. Try to create a neighborhood or building rating
4. Check your Supabase dashboard to see if the data appears in the tables

## Troubleshooting

### Images Not Uploading
- Make sure your storage buckets are public
- Verify the storage policies are correctly set
- Check browser console for errors

### Authentication Issues
- Verify your Supabase URL and keys in `.env.local`
- Check that email auth is enabled
- Verify redirect URLs are configured

### Database Errors
- Check that all tables were created successfully
- Verify Row Level Security policies are in place
- Look at the Supabase logs for detailed error messages

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmation in Authentication settings
- [ ] Configure a proper SMTP provider for emails
- [ ] Update Site URL and Redirect URLs to production domain
- [ ] Review and tighten Row Level Security policies if needed
- [ ] Set up database backups
- [ ] Configure rate limiting (available in Supabase Pro)
- [ ] Update CORS settings if needed
- [ ] Monitor usage and upgrade plan if needed

---

Need help? Check the [Supabase Documentation](https://supabase.com/docs) or [join their Discord](https://discord.supabase.com).

