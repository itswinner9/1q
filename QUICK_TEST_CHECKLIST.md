# Quick Test Checklist - Verify Rating System Works 100%

## Before Testing: Setup (Do Once)

### 1. Run Database SQL
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy and run the entire SQL from `RATING_SYSTEM_SETUP.md`
- [ ] Verify: No errors in console

### 2. Create Storage Buckets
- [ ] Go to Supabase Dashboard → Storage
- [ ] Create bucket: `building-images` (Public)
- [ ] Create bucket: `neighborhood-images` (Public)
- [ ] Create bucket: `landlord-images` (Public)
- [ ] Set policies for each bucket (see RATING_SYSTEM_SETUP.md)

## Test 1: User Registration (2 minutes)

- [ ] Go to `/signup`
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `password123`
- [ ] Click "Sign Up"
- [ ] ✅ Success: Redirected to home page, logged in
- [ ] ❌ Failed: Check Supabase logs

## Test 2: Rate a Building (3 minutes)

- [ ] Click "Rate" button in navigation
- [ ] Select "Apartment/Building"
- [ ] ✅ Form loads without errors

### Search & Auto-fill
- [ ] Type an address in search box (e.g., "123 Main St, Toronto")
- [ ] Select from dropdown
- [ ] ✅ Address, city, province auto-fill
- [ ] ✅ Building name auto-fills

### Rate All Categories
- [ ] Click 5 stars for "Management"
- [ ] Click 4 stars for "Cleanliness"
- [ ] Click 5 stars for "Maintenance"
- [ ] Click 4 stars for "Rent Value"
- [ ] Click 5 stars for "Noise Level"
- [ ] Click 5 stars for "Amenities"
- [ ] ✅ All 6 categories have stars selected

### Optional Fields
- [ ] Type a comment (optional)
- [ ] Upload 1-2 photos (optional)
- [ ] ✅ Photos preview shows

### Submit
- [ ] Click "Submit Rating"
- [ ] ✅ Success message appears
- [ ] ✅ Redirected to explore page
- [ ] ✅ Review shows immediately (since rating is 3+ stars)

## Test 3: Rate a Neighborhood (3 minutes)

- [ ] Click "Rate" button in navigation
- [ ] Select "Neighborhood"
- [ ] ✅ Form loads without errors

### Search & Auto-fill
- [ ] Type a neighborhood name (e.g., "Downtown Toronto")
- [ ] Select from dropdown
- [ ] ✅ Name, city, province auto-fill

### Rate All Categories
- [ ] Click stars for "Safety"
- [ ] Click stars for "Cleanliness"
- [ ] Click stars for "Noise Level"
- [ ] Click stars for "Community"
- [ ] Click stars for "Transit Access"
- [ ] Click stars for "Amenities"
- [ ] ✅ All 6 categories have stars selected

### Submit
- [ ] Click "Submit Rating"
- [ ] ✅ Success message appears
- [ ] Note: Neighborhood reviews go to "pending" (admin must approve)

## Test 4: Low Rating (Auto-Approval Check)

- [ ] Rate another building
- [ ] Give 1-2 stars for most categories (low rating)
- [ ] Submit
- [ ] ✅ Success message says "pending admin review"
- [ ] ✅ Review does NOT show immediately on explore page
- [ ] ✅ Admin can see it at `/admin/pending`

## Test 5: Duplicate Prevention

- [ ] Try to rate the SAME building again
- [ ] Use same address
- [ ] ✅ System updates your existing review (no duplicate created)
- [ ] OR
- [ ] ❌ If error occurs, should say "already reviewed"

## Test 6: Admin Features (If you're admin)

- [ ] Go to `/admin`
- [ ] ✅ Can see admin dashboard
- [ ] Go to `/admin/pending`
- [ ] ✅ Can see pending reviews
- [ ] Click "Approve" on a review
- [ ] ✅ Review now appears on explore page

## Test 7: Anonymous vs Named

### Test Anonymous (default)
- [ ] Rate a location
- [ ] Keep "Post Anonymously" selected
- [ ] Submit
- [ ] ✅ Review shows as "Anonymous User"

### Test Named
- [ ] Rate a different location
- [ ] Select "Show My Name"
- [ ] Enter display name
- [ ] Submit
- [ ] ✅ Review shows your display name

## Test 8: Images Upload

- [ ] Rate a location
- [ ] Upload 2-3 images
- [ ] ✅ Image previews show
- [ ] Submit
- [ ] View the review on explore page
- [ ] ✅ Images display correctly in review

## Test 9: Form Validation

### Missing Fields
- [ ] Try to submit without rating all categories
- [ ] ✅ Error: "Please rate all categories"

### Missing Location
- [ ] Try to submit without entering address
- [ ] ✅ Error: "Please fill in all details"

### Not Logged In
- [ ] Log out
- [ ] Try to access `/rate/building`
- [ ] ✅ Redirected to login page

## Test 10: Mobile Experience (Bonus)

- [ ] Open on mobile device
- [ ] Try rating flow
- [ ] ✅ All buttons work
- [ ] ✅ Star clicking works on mobile
- [ ] ✅ Form is responsive

## Success Criteria - All Must Pass

✅ Users can sign up in under 1 minute
✅ Search auto-completes addresses
✅ All 6 star categories can be clicked
✅ Form validates before submission
✅ High ratings (3+) auto-approve and show immediately
✅ Low ratings (1-2) go to pending
✅ Images upload successfully
✅ No duplicates are created
✅ Admins can approve/reject reviews
✅ Anonymous posting works
✅ Mobile works smoothly

## If Any Test Fails

1. **Check Browser Console (F12)** for errors
2. **Check Supabase Logs** in dashboard
3. **Verify SQL ran successfully** (no errors)
4. **Check storage buckets exist** and are public
5. **Try with different user** (create new account)
6. **Clear browser cache** and try again

## Quick Fixes

### "Not authenticated" error
→ Make sure you're logged in

### "Must rate all categories"
→ Click ALL 6 sets of stars

### Images won't upload
→ Check storage buckets are created and public

### Review not showing
→ Low ratings need admin approval (check `/admin/pending`)

### Duplicate error
→ You already reviewed this location (edit existing review instead)

## Final Check

After all tests pass:
- [ ] Create 5 test reviews (mix of buildings and neighborhoods)
- [ ] Verify all show correctly on explore page
- [ ] Verify ratings calculate correctly
- [ ] Verify images display
- [ ] System is ready for real users! 🎉

---

**Need help?** Check `RATING_SYSTEM_SETUP.md` for detailed instructions or `USER_GUIDE.md` for user-facing help.
