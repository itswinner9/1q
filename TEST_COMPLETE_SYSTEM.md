# 🧪 LivRank Complete System Test

## ✅ Database Connection Test

Your database is connected:
- **Supabase URL**: `https://eehtzdpzbjsuendgwnwy.supabase.co`
- **Status**: ✅ Connected

---

## 📋 Complete Testing Checklist

### 1️⃣ **User Registration Test**

**Steps:**
1. Go to: http://localhost:3002/signup
2. Fill in:
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
3. Click "Sign Up"

**Expected Result:**
- ✅ Redirected to homepage
- ✅ User automatically logged in
- ✅ User profile created in `user_profiles` table
- ✅ Navigation shows profile icon

**What to Check:**
- No errors in browser console (F12)
- Can see "Profile" link in navigation
- User is logged in

---

### 2️⃣ **User Login Test**

**Steps:**
1. Logout first (if logged in)
2. Go to: http://localhost:3002/login
3. Enter:
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
4. Click "Sign In"

**Expected Result:**
- ✅ Redirected to homepage
- ✅ User logged in successfully
- ✅ Navigation shows profile icon
- ✅ Can access protected pages

**What to Check:**
- No "Invalid credentials" error
- Profile icon visible in navigation
- Can access `/rate/building` and `/rate/neighborhood`

---

### 3️⃣ **Rate a Building Test**

**Steps:**
1. Make sure you're logged in
2. Go to: http://localhost:3002/rate/building
3. Search for an address: `100 King Street West, Toronto`
4. Fill in all ratings (click stars for each category)
5. Add optional comment: "Great building, clean and well-maintained"
6. Upload 1-2 photos (optional)
7. Click "Submit Rating"

**Expected Result:**
- ✅ Success message appears
- ✅ Redirected to explore page
- ✅ Building created in database (or found existing)
- ✅ Review added to `building_reviews` table
- ✅ Average rating calculated automatically

**Console Logs to See:**
```
🔍 Checking if building exists: 100 King Street West, Toronto
✅ Found existing building: [name] OR ✅ Created new building location...
📝 Will add your review to this existing building
✅ Your review created! (Trigger will calculate average)
```

**What to Check:**
- No errors in console
- Can see building in explore page
- Rating appears correctly
- No duplicate buildings created

---

### 4️⃣ **Rate a Neighborhood Test**

**Steps:**
1. Go to: http://localhost:3002/rate/neighborhood
2. Search: `King, Toronto, Ontario`
3. Rate all categories (Safety, Cleanliness, Noise, etc.)
4. Add comment: "Quiet neighborhood with great amenities"
5. Upload photos (optional)
6. Click "Submit Rating"

**Expected Result:**
- ✅ Success message
- ✅ Redirected to explore page
- ✅ Neighborhood created/updated in database
- ✅ Review added successfully
- ✅ No duplicates

**Console Logs:**
```
🔍 Checking if neighborhood exists: King, Toronto, Ontario
✅ Neighborhood location exists OR ✅ Creating new neighborhood location...
✅ Your review created!
```

---

### 5️⃣ **Search & Autocomplete Test**

**Steps:**
1. Go to homepage: http://localhost:3002
2. Type in search box: `Toronto`
3. Wait for suggestions to appear
4. Click a suggestion

**Expected Result:**
- ✅ Autocomplete dropdown appears
- ✅ Shows Canadian cities/addresses
- ✅ Clicking suggestion navigates to explore page
- ✅ Shows results for that location

**Console Logs:**
```
🔍 Searching Photon for: Toronto
✅ Photon results: 10
🇨🇦 Canadian results: 8
```

---

### 6️⃣ **View Building/Neighborhood Details**

**Steps:**
1. Go to explore: http://localhost:3002/explore
2. Click on any building or neighborhood card
3. View the detail page

**Expected Result:**
- ✅ See average rating
- ✅ See total reviews count
- ✅ See all reviews listed
- ✅ See category breakdown
- ✅ Can upvote/downvote reviews (if logged in)
- ✅ "Rate" button works and pre-fills data

---

### 7️⃣ **Database Verification**

**Go to Supabase Dashboard:**
https://supabase.com/dashboard/project/eehtzdpzbjsuendgwnwy

**Check These Tables:**

1. **user_profiles**
   - New user should be there
   - Has role = 'user'

2. **buildings**
   - Building you rated should exist
   - Has correct address, city, province
   - Has average_rating and total_reviews calculated

3. **building_reviews**
   - Your review should be there
   - Has all category ratings
   - Has your comment
   - Status should be 'approved' (if rating >= 3 stars)

4. **neighborhoods**
   - Neighborhood you rated should exist
   - Has average_rating calculated

5. **neighborhood_reviews**
   - Your neighborhood review should be there

---

## 🐛 Common Issues & Solutions

### Issue 1: Can't Register
**Error:** "User already registered"
**Solution:** User email already exists. Use a different email or delete from Supabase.

### Issue 2: Can't Login
**Error:** "Invalid credentials"
**Solution:** 
- Check password is correct
- Check email is confirmed in Supabase Auth

### Issue 3: Can't Submit Rating
**Error:** "Error submitting rating"
**Solution:**
- Check browser console for specific error
- Make sure all required fields filled
- Make sure database triggers are set up (run `LIVRANK_COMPLETE_DB.sql`)

### Issue 4: Duplicates Created
**Error:** Multiple buildings with same address
**Solution:**
- The improved code now prevents this
- Old duplicates may exist from before
- Can manually merge in database

### Issue 5: Autocomplete Not Working
**Error:** No suggestions appear
**Solution:**
- Check browser console
- Should see Photon API logs
- Clear cache and hard refresh

---

## 🚀 Quick Test Commands

**Test Database Connection:**
```javascript
// Open browser console on any page
console.log('Testing Supabase connection...')
const { supabase } = await import('/lib/supabase')
const { data, error } = await supabase.from('neighborhoods').select('count')
console.log('Result:', data, error)
```

**Check Current User:**
```javascript
const { data: { session } } = await supabase.auth.getSession()
console.log('Current user:', session?.user?.email)
```

---

## ✅ Success Criteria

All tests pass if:
- ✅ Can register new user
- ✅ Can login with credentials
- ✅ Can rate building without errors
- ✅ Can rate neighborhood without errors
- ✅ Autocomplete works and shows suggestions
- ✅ No duplicate buildings/neighborhoods created
- ✅ Ratings appear in database
- ✅ Average ratings calculated correctly
- ✅ Can view detail pages
- ✅ Can see all reviews

---

## 📞 Need Help?

If any test fails:
1. Check browser console (F12) for errors
2. Check Supabase logs in dashboard
3. Verify database tables exist
4. Verify triggers are set up
5. Check `.env.local` has correct credentials

---

**Ready to test? Start with #1 (User Registration)!** 🎉



