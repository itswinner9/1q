-- ════════════════════════════════════════════════════════════════════════════
-- FIX USER PROFILES TRIGGER
-- ════════════════════════════════════════════════════════════════════════════
-- This ensures user profiles are created automatically when users sign up
-- ════════════════════════════════════════════════════════════════════════════

-- First, check if user_profiles table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        -- Create user_profiles table if it doesn't exist
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY "Users can view all profiles"
            ON user_profiles FOR SELECT
            USING (true);

        CREATE POLICY "Users can update own profile"
            ON user_profiles FOR UPDATE
            USING (auth.uid() = id);

        RAISE NOTICE 'Created user_profiles table';
    ELSE
        RAISE NOTICE 'user_profiles table already exists';
        
        -- Add role column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'role'
        ) THEN
            ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'user';
            RAISE NOTICE 'Added role column to user_profiles';
        END IF;
    END IF;
END $$;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ════════════════════════════════════════════════════════════════════════════

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- If you see a row with trigger_name = 'on_auth_user_created', it's working! ✅

-- ════════════════════════════════════════════════════════════════════════════
-- TEST (Optional)
-- ════════════════════════════════════════════════════════════════════════════

-- Check existing user profiles (role column should now exist)
SELECT * 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- ════════════════════════════════════════════════════════════════════════════
-- SUCCESS! 🎉
-- ════════════════════════════════════════════════════════════════════════════
-- Now when users sign up, their profile will be created automatically!
-- ════════════════════════════════════════════════════════════════════════════

