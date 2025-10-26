# 🔍 QUICK SUPABASE CHECK

## Step 1: Check if Database Setup Actually Worked

Go to Supabase Dashboard and check:

### A. Check Tables
1. Go to **Table Editor** in Supabase
2. Do you see these tables?
   - ✅ user_profiles
   - ✅ neighborhoods  
   - ✅ buildings
   - ✅ neighborhood_reviews
   - ✅ building_reviews

**If you DON'T see all 5 tables → The SQL didn't run properly!**

### B. Check if SQL Ran Successfully
1. When you ran the SQL, did you see this at the bottom?
   ```
   ✅ DATABASE SETUP COMPLETE!
   Total Users: X
   Admin Users: 1
   ```

**If you didn't see this → The SQL had an error!**

### C. Check for Errors
1. In Supabase SQL Editor, look for any RED error messages
2. Common errors:
   - "permission denied" → Your Supabase user doesn't have rights
   - "already exists" → Some tables already exist (need to drop them first)
   - "timeout" → Supabase is slow, try again

---

## Step 2: Alternative - Use Supabase UI (No SQL)

If SQL isn't working, we can create tables manually:

### Create user_profiles Table Manually:
1. Go to **Table Editor** → **New Table**
2. Table name: `user_profiles`
3. Add columns:
   - `id` → UUID → Primary Key → Reference: auth.users
   - `email` → text → Unique
   - `full_name` → text
   - `is_admin` → bool → Default: false
   - `is_banned` → bool → Default: false
   - `ban_reason` → text → nullable
   - `banned_at` → timestamptz → nullable
   - `created_at` → timestamptz → Default: now()
   - `updated_at` → timestamptz → Default: now()

**But this is tedious for all tables!**

---

## Step 3: What Error Are You Seeing?

Tell me EXACTLY what you see:

**Option A: Tables don't exist**
→ SQL didn't run or failed

**Option B: Tables exist but login still fails**  
→ Different problem (maybe RLS policies)

**Option C: SQL gives an error when you run it**
→ Tell me the error message

**Option D: Nothing happens when you click RUN**
→ Supabase might be having issues

---

## Step 4: Nuclear Option - Disable RLS

If tables exist but login fails, try this in SQL Editor:

```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

Then try login again.

---

## Tell Me:
1. Do you see the 5 tables in Table Editor? (Yes/No)
2. What error message do you see when trying to login?
3. Did you see "✅ DATABASE SETUP COMPLETE!" when running the SQL?

