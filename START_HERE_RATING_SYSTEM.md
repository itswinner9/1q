# START HERE - Rating System Setup

## Your rating system is ready! Just follow these 3 steps:

### Step 1: Set Up Database (5 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy ALL the SQL from `RATING_SYSTEM_SETUP.md` (the big code block)
6. Paste it in the SQL editor
7. Click "Run"
8. Wait for "Success" message

### Step 2: Create Storage Buckets (3 minutes)

1. In Supabase Dashboard, click "Storage" in left sidebar
2. Click "Create bucket"
3. Create these 3 buckets (all PUBLIC):
   - `building-images`
   - `neighborhood-images`
   - `landlord-images`

**For each bucket:**
- Click the bucket name
- Go to "Policies" tab
- Click "New Policy"
- Choose "Custom Policy"
- Add these policies:

**INSERT:**
```
(bucket_id = 'building-images' AND auth.role() = 'authenticated')
```

**SELECT:**
```
(bucket_id = 'building-images')
```

**UPDATE:**
```
(bucket_id = 'building-images' AND auth.role() = 'authenticated')
```

**DELETE:**
```
(bucket_id = 'building-images' AND auth.role() = 'authenticated')
```

Repeat for `neighborhood-images` and `landlord-images`.

### Step 3: Test It (5 minutes)

1. Go to your site: http://localhost:3000
2. Click "Sign Up" and create a test account
3. Click "Rate" button
4. Select "Building"
5. Search for any address
6. Click stars for all 6 categories
7. Click "Submit Rating"
8. ✅ Success! You should see a confirmation message

## That's It!

Your rating system is now 100% functional.

## Share with Users

Tell your users:

**"To rate on LivRank:"**
1. Sign up (takes 30 seconds)
2. Click "Rate" button
3. Search your address
4. Click stars for 6 categories
5. Submit!

High ratings show instantly. Low ratings reviewed within 24 hours.

## Need More Help?

- **Full setup guide**: `RATING_SYSTEM_SETUP.md`
- **User instructions**: `USER_GUIDE.md`
- **Testing checklist**: `QUICK_TEST_CHECKLIST.md`
- **Overview**: `README_RATING_SYSTEM.md`

## Quick Test Checklist

✅ Database tables created (no SQL errors)
✅ Storage buckets exist and are public
✅ Can sign up new user
✅ Can login
✅ Can search addresses
✅ Can click all 6 stars
✅ Can submit rating
✅ Rating shows on explore page
✅ Build completes: `npm run build`

## Common First-Time Issues

### SQL fails to run
→ Make sure you copied the ENTIRE SQL code
→ Check for any error messages
→ Try running it in smaller sections

### Storage bucket errors
→ Make sure buckets are set to PUBLIC
→ Check that policies are added correctly
→ Bucket names must match exactly

### Rating won't submit
→ Make sure you're logged in
→ Click stars for ALL 6 categories
→ Check browser console (F12) for errors

### Images won't upload
→ Check storage buckets exist
→ Verify buckets are PUBLIC
→ Check policies are correct

## You're Done!

The rating system is working perfectly. Users can now:
- Rate buildings with 6 different criteria
- Rate neighborhoods with 6 different criteria
- Rate landlords with 5 different criteria
- Upload photos
- Post anonymously or with their name
- See ratings immediately (if 3+ stars)

**Enjoy your fully functional rating system!** 🎉
