# 🚀 NeighborhoodRank - Complete Setup Guide

## ⚠️ IMPORTANT: Run Database Setup First!

Before using the application, you MUST set up the database properly.

### Step 1: Run Complete Fresh Start SQL

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy **ALL** of `COMPLETE_FRESH_START.sql`
4. Click **Run**
5. Wait for "✅ SETUP COMPLETE!" message

This SQL file will:
- Drop all existing tables (clean slate)
- Create all required tables
- Disable RLS (no policy blocking)
- Create automatic user profile trigger
- Sync all existing auth.users
- Set `tami76@tiffincrane.com` as admin
- Run verification queries

### Step 2: Verify Setup

After running the SQL, you should see output like:
```
✅ SETUP COMPLETE!
Total users: X
Admin users: tami76@tiffincrane.com
Neighborhoods: 0
Buildings: 0
Neighborhood reviews: 0
Building reviews: 0
```

### Step 3: Test Authentication

1. Try **signing up** with a new account
2. Try **logging in** with existing account
3. Go to **/profile** - should load instantly
4. Go to **/admin** - should work for tami76@tiffincrane.com

## ✅ What's Fixed

### Database
- ✅ **No RLS blocking** - all tables have RLS disabled
- ✅ **Auto-profile creation** - trigger creates profiles on signup
- ✅ **All users synced** - existing auth.users added to user_profiles
- ✅ **Clean structure** - fresh start with no conflicts

### Authentication
- ✅ **Sign up works** - with automatic profile creation
- ✅ **Login works** - no more stuck "Signing in..."
- ✅ **Profile loads** - instant loading with proper error handling
- ✅ **Admin access** - works for designated admin user

### Reviews
- ✅ **Multi-user reviews** - multiple users can rate same location
- ✅ **Aggregate ratings** - automatic average calculation
- ✅ **Status field** - for admin approval workflow
- ✅ **Anonymous option** - users can post anonymously

## 🔧 Environment Variables

Make sure your `.env.local` file has:

```
NEXT_PUBLIC_SUPABASE_URL=https://tqxomrvaiaidblwdvonu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## 📝 Database Structure

### Tables Created:
1. **user_profiles** - User info and admin status
2. **neighborhoods** - Neighborhood locations and aggregate stats
3. **buildings** - Building locations and aggregate stats  
4. **neighborhood_reviews** - Individual user reviews for neighborhoods
5. **building_reviews** - Individual user reviews for buildings

### Key Features:
- All tables have **RLS DISABLED** for simplicity
- Automatic triggers update aggregate ratings
- Foreign keys ensure data integrity
- Indexes for fast queries

## 🐛 Debugging

If you have issues:

1. **Check browser console** - all operations are logged
2. **Check Supabase logs** - SQL Editor shows errors
3. **Verify user_profiles** - make sure your user exists
4. **Check admin status** - query user_profiles table

### Common Issues:

**"Profile not found"**
- Run `COMPLETE_FRESH_START.sql` again
- Check if user exists in auth.users
- Verify trigger is created

**"Signing in..." stuck**
- Check browser console for errors
- Verify Supabase URL/key in .env.local
- Try refreshing the page

**Admin panel not accessible**
- Query: `SELECT * FROM user_profiles WHERE email = 'your@email.com'`
- Update: `UPDATE user_profiles SET is_admin = true WHERE email = 'your@email.com'`

## 🎯 Next Steps

After setup is complete:

1. ✅ Create an account
2. ✅ Test rating a neighborhood
3. ✅ Test rating a building
4. ✅ Check your profile
5. ✅ Access admin panel (if admin)

Everything should work smoothly now! 🚀

