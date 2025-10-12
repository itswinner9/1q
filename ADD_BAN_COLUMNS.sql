-- 🔧 ADD BAN COLUMNS TO user_profiles

-- Add ban-related columns if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- ✅ Done! Now you can ban users.
