-- ✅ ADD BAN REASON COLUMNS TO USER_PROFILES

-- Add columns to track ban details
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- Update existing banned users (if any) with a default reason
UPDATE user_profiles 
SET 
  ban_reason = 'Account suspended by administrator',
  banned_at = NOW()
WHERE is_banned = true 
AND ban_reason IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('ban_reason', 'banned_at');

-- Show current banned users with their reasons
SELECT id, email, is_banned, ban_reason, banned_at
FROM user_profiles
WHERE is_banned = true;

-- ✅ Ban reason tracking is now available!
