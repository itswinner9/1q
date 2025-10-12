# 🚨 QUICK FIX: Login Stuck Issue

## Problem
Login button shows "Signing in..." and never completes.

## Solution

### Step 1: Check .env.local File

Run this command:
```bash
ls -la .env.local
```

**If file doesn't exist:**
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://tqxomrvaiaidblwdvonu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeG9tcnZhaWFpZGJsd2R2b251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTM0MjIsImV4cCI6MjA3NTc2OTQyMn0.BS4Wp5lNSclPw5fxtfykI2l7HuAtPm4zzHqEyVmCXQc
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoic2FhYW11c2UiLCJhIjoiY21nbW92aGhnMWsybDJvb2Vha3VudW1lNyJ9.WiiM88O6xOL_aA2y-4LYqw
EOF
```

### Step 2: Restart Dev Server

**CRITICAL: You MUST restart after creating/updating .env.local**

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 3: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

OR

Try in Incognito/Private browsing mode

### Step 4: Check Console for Errors

1. Press F12 to open browser console
2. Try logging in again
3. Look for error messages in red

Common errors:
- `supabaseUrl is required` → .env.local missing or server not restarted
- `Invalid login credentials` → Wrong password or user doesn't exist
- `Network error` → Check internet or Supabase status

### Step 5: Verify Database Setup

Make sure you've run the SQL setup:

```sql
-- Run this in Supabase SQL Editor
-- Use FIX_EVERYTHING_NOW.sql or ROLE_BASED_AUTH_SETUP.sql
```

### Step 6: Test Login

Credentials for admin:
- Email: `tami76@tiffincrane.com`
- Password: (your actual password)

### If Still Not Working:

1. **Check Supabase Dashboard:**
   - Go to Authentication → Users
   - Verify the user exists
   - Check if email is confirmed

2. **Try Password Reset:**
   - Go to Supabase → Authentication → Users
   - Find the user
   - Click "Send password reset email"

3. **Create New Test User:**
   ```bash
   # Sign up with a new email to test if signup works
   ```

4. **Check browser console** for the EXACT error message

---

## Quick Checklist

- [ ] .env.local file exists
- [ ] .env.local has correct Supabase URL and anon key
- [ ] Dev server restarted after creating .env.local
- [ ] Browser cache cleared
- [ ] User exists in Supabase auth.users
- [ ] user_profiles table exists
- [ ] User is marked as admin in user_profiles

---

## Most Common Issue: Server Not Restarted

**90% of the time, the issue is that you created .env.local but didn't restart the dev server.**

Next.js only reads .env files when it starts. Changes to .env.local require a restart!

```bash
# In your terminal where dev server is running:
# Press Ctrl+C to stop
# Then run:
npm run dev
```

