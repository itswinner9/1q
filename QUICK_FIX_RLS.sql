-- ════════════════════════════════════════════════════════════════════════════
-- 🚨 QUICK FIX FOR RLS POLICY ERROR
-- ════════════════════════════════════════════════════════════════════════════
-- This fixes the "row-level security policy" error you're seeing
-- ════════════════════════════════════════════════════════════════════════════

-- First, let's check if the user_profiles table exists and has the role column
DO $$ 
BEGIN
    -- Check if user_profiles table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Create user_profiles table if it doesn't exist
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'user' NOT NULL,
            bio TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created user_profiles table';
    ELSE
        -- Check if role column exists, if not add it
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
            ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;
            RAISE NOTICE 'Added role column to user_profiles';
        ELSE
            RAISE NOTICE 'user_profiles table already exists with role column';
        END IF;
    END IF;
END $$;

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create RLS policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Now let's handle the neighborhoods table
DO $$ 
BEGIN
    -- Check if neighborhoods table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'neighborhoods') THEN
        -- Create neighborhoods table if it doesn't exist
        CREATE TABLE neighborhoods (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            province TEXT NOT NULL,
            country TEXT DEFAULT 'Canada',
            description TEXT,
            cover_image TEXT,
            latitude NUMERIC(10, 8),
            longitude NUMERIC(11, 8),
            
            -- Aggregated ratings
            overall_rating NUMERIC(3, 2) DEFAULT 0,
            safety_rating NUMERIC(3, 2) DEFAULT 0,
            walkability_rating NUMERIC(3, 2) DEFAULT 0,
            transit_rating NUMERIC(3, 2) DEFAULT 0,
            schools_rating NUMERIC(3, 2) DEFAULT 0,
            amenities_rating NUMERIC(3, 2) DEFAULT 0,
            quiet_rating NUMERIC(3, 2) DEFAULT 0,
            
            total_reviews INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            
            UNIQUE(name, city, province)
        );
        
        RAISE NOTICE 'Created neighborhoods table';
    ELSE
        RAISE NOTICE 'neighborhoods table already exists';
    END IF;
END $$;

-- Enable RLS on neighborhoods
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Neighborhoods are viewable by everyone" ON neighborhoods;
DROP POLICY IF EXISTS "Admins can insert neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Admins can update neighborhoods" ON neighborhoods;

-- Create RLS policies for neighborhoods
CREATE POLICY "Neighborhoods are viewable by everyone"
  ON neighborhoods FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert neighborhoods"
  ON neighborhoods FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update neighborhoods"
  ON neighborhoods FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create the trigger function for auto-creating user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to make users admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RETURN 'User not found. Please make sure they have signed up first.';
  END IF;
  
  -- Update their role to admin
  UPDATE user_profiles
  SET role = 'admin'
  WHERE id = user_uuid;
  
  IF FOUND THEN
    RETURN 'Success! User ' || user_email || ' is now an admin.';
  ELSE
    RETURN 'User profile not found. They may need to log in once first.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ RLS POLICY ERROR FIXED!';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 WHAT WAS FIXED:';
  RAISE NOTICE '  ✅ user_profiles table created/updated with role column';
  RAISE NOTICE '  ✅ neighborhoods table created with proper RLS policies';
  RAISE NOTICE '  ✅ RLS policies allow authenticated users to insert';
  RAISE NOTICE '  ✅ Auto-profile creation trigger installed';
  RAISE NOTICE '  ✅ make_user_admin function available';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NOW YOU CAN:';
  RAISE NOTICE '  1. Sign up new users (profiles auto-created)';
  RAISE NOTICE '  2. Rate neighborhoods (RLS policies fixed)';
  RAISE NOTICE '  3. Make users admin: SELECT make_user_admin(''email@example.com'');';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════════════════';
END $$;
