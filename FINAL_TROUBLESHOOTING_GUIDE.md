# Final Troubleshooting & Setup Guide

## 🔧 **Current Issues**

1. ❌ Admin can't upload cover images for buildings
2. ❌ Rating system not functioning properly

---

## 🚀 **COMPLETE FIX - Step by Step**

### **STEP 1: Run Complete Database Setup**

1. Go to Supabase: https://app.supabase.com
2. Select project: `eehtzdpzbjsuendgwnwy`
3. Click **"SQL Editor"**
4. Click **"New Query"**
5. Copy ALL of **`COMPLETE_FINAL_SETUP.sql`**
6. Paste and click **"RUN"**
7. Wait for success message

**This creates:**
- ✅ All tables with correct structure
- ✅ RLS policies
- ✅ Triggers for auto-updates
- ✅ Like/dislike system
- ✅ Admin user

---

### **STEP 2: Create Storage Buckets**

**You MUST create 3 storage buckets manually:**

#### **Bucket 1: neighborhood-images**
1. In Supabase, click **"Storage"** in left sidebar
2. Click **"Create a new bucket"**
3. Name: `neighborhood-images`
4. Public: ✅ **YES** (check this!)
5. Click **"Create"**

#### **Bucket 2: building-images**
1. Click **"Create a new bucket"** again
2. Name: `building-images`
3. Public: ✅ **YES**
4. Click **"Create"**

#### **Bucket 3: review-images**
1. Click **"Create a new bucket"** again
2. Name: `review-images`
3. Public: ✅ **YES**
4. Click **"Create"**

---

### **STEP 3: Set Storage Policies**

**For EACH bucket, do this:**

1. Click on the bucket name
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Click **"Get started quickly"**
5. Select: **"Allow public access for SELECT"**
6. Click **"Review"**
7. Click **"Save policy"**

8. Click **"New Policy"** again
9. Click **"For full customization"**
10. Policy name: `Authenticated users can upload`
11. Allowed operation: Check **"INSERT"**
12. Target roles: `authenticated`
13. WITH CHECK: Type `true`
14. Click **"Save policy"**

15. Click **"New Policy"** again
16. Policy name: `Users can delete own files`
17. Allowed operation: Check **"DELETE"**
18. Target roles: `authenticated`
19. USING: Type `(auth.uid() = owner) OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)`
20. Click **"Save policy"**

**Do this for ALL 3 buckets!**

---

### **STEP 4: Verify Everything**

Run this SQL to check:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check admin user
SELECT email, is_admin FROM user_profiles WHERE is_admin = true;

-- Check storage buckets (run in Storage section, not SQL Editor)
```

---

## 🧪 **Testing Checklist**

### **✅ Test 1: Admin Cover Upload**
1. Login as admin: `ophelia7067@tiffincrane.com`
2. Go to: http://localhost:3000/admin/buildings
3. Click "Upload Cover" on any building
4. Select an image
5. Should upload successfully
6. Image should appear immediately

### **✅ Test 2: Rate a Neighborhood**
1. Go to: http://localhost:3000/rate/neighborhood
2. Fill in location details
3. Give 6 ratings
4. Add comment
5. Choose anonymous/named
6. Submit
7. Should redirect to explore page
8. Review should appear

### **✅ Test 3: Rate a Building**
1. Go to: http://localhost:3000/rate/building
2. Fill in building details
3. Give 6 ratings
4. Add comment
5. Choose anonymous/named
6. Submit
7. Should work now!

### **✅ Test 4: Like/Dislike**
1. Go to any location page with reviews
2. Click thumbs up/down
3. Vote count should update
4. Button should highlight

---

## 🆘 **Troubleshooting Common Errors**

### **Error: "Bucket not found"**
**Fix:** Create storage buckets (see STEP 2 above)

### **Error: "violates row-level security policy"**
**Fix:** Set storage policies (see STEP 3 above)

### **Error: "relation does not exist"**
**Fix:** Run COMPLETE_FINAL_SETUP.sql

### **Error: "Can't find variable: isAnonymous"**
**Fix:** Already fixed in code! Clear browser cache (Cmd+Shift+R)

### **Error: "duplicate key value"**
**Fix:** You already rated this location. Edit your existing review instead.

### **Rating doesn't submit:**
1. Open browser console (F12)
2. Look for red errors
3. Share the exact error message

---

## 📋 **Quick Verification SQL**

Run this in Supabase SQL Editor to verify setup:

```sql
-- Check all tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check admin user
SELECT email, full_name, is_admin, created_at 
FROM user_profiles 
WHERE is_admin = true;

-- Check existing reviews
SELECT 
  'Neighborhoods' as type, COUNT(*) as count 
FROM neighborhoods
UNION ALL
SELECT 'Buildings', COUNT(*) FROM buildings
UNION ALL
SELECT 'Neighborhood Reviews', COUNT(*) FROM neighborhood_reviews
UNION ALL
SELECT 'Building Reviews', COUNT(*) FROM building_reviews;
```

---

## 🎯 **Summary**

**To fix everything:**

1. ✅ Run `COMPLETE_FINAL_SETUP.sql` (creates all tables)
2. ✅ Create 3 storage buckets (manual in Supabase UI)
3. ✅ Set storage policies (manual in Supabase UI)
4. ✅ Test rating forms
5. ✅ Test admin cover upload

**All files ready, just need to run them!**


