# 📸 Image Storage Setup Guide - IMPORTANT!

## ⚠️ Why Images Weren't Showing

Your images weren't displaying because:
1. Storage buckets might not be configured as PUBLIC
2. Public URL generation wasn't working correctly
3. File paths weren't organized properly

## ✅ I Fixed The Code

### What I Changed:

**Neighborhood Images:**
- Better file naming with user ID folders
- Proper public URL retrieval
- Error handling for failed uploads
- Console logging for debugging

**Building Images:**
- Same improvements as above
- Organized by user folders
- Better error handling

### New File Structure:
```
neighborhood-images/
  └── neighborhoods/
      └── {user_id}/
          └── {timestamp}-{filename}.jpg

building-images/
  └── buildings/
      └── {user_id}/
          └── {timestamp}-{filename}.jpg
```

---

## 🔧 Set Up Supabase Storage (CRITICAL!)

### Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click **"New bucket"**

#### Create Neighborhood Images Bucket:
```
Name: neighborhood-images
Public: ✅ YES (MUST be checked!)
File size limit: 5MB
Allowed MIME types: image/*
```

#### Create Building Images Bucket:
```
Name: building-images
Public: ✅ YES (MUST be checked!)
File size limit: 5MB
Allowed MIME types: image/*
```

---

### Step 2: Set Storage Policies

For EACH bucket, you need to add these policies:

#### Go to Storage → Click bucket → Policies tab

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'neighborhood-images');
```

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'building-images');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'neighborhood-images' AND auth.role() = 'authenticated');
```

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'building-images' AND auth.role() = 'authenticated');
```

**Policy 3: Users can update own files**
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'neighborhood-images' AND auth.uid()::text = (storage.foldername(name))[2]);
```

```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'building-images' AND auth.uid()::text = (storage.foldername(name))[2]);
```

**Policy 4: Users can delete own files**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'neighborhood-images' AND auth.uid()::text = (storage.foldername(name))[2]);
```

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'building-images' AND auth.uid()::text = (storage.foldername(name))[2]);
```

---

## 🎯 Quick Setup (Copy-Paste)

### Option A: Use Supabase Dashboard

1. **Storage → New Bucket**
   - Name: `neighborhood-images`
   - Check "Public bucket" ✅
   - Create

2. **Storage → New Bucket**
   - Name: `building-images`
   - Check "Public bucket" ✅
   - Create

3. **For each bucket → Policies → New Policy**
   - Use the SQL above for each policy

---

### Option B: Use SQL Editor

Go to **SQL Editor** and run this all at once:

```sql
-- Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('neighborhood-images', 'neighborhood-images', true),
  ('building-images', 'building-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for neighborhood-images
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'neighborhood-images');

CREATE POLICY IF NOT EXISTS "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'neighborhood-images');

CREATE POLICY IF NOT EXISTS "Users update own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'neighborhood-images' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY IF NOT EXISTS "Users delete own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'neighborhood-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Policies for building-images
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'building-images');

CREATE POLICY IF NOT EXISTS "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'building-images');

CREATE POLICY IF NOT EXISTS "Users update own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'building-images' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY IF NOT EXISTS "Users delete own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'building-images' AND auth.uid()::text = (storage.foldername(name))[2]);
```

---

## 🧪 Test Image Upload

### Step 1: Rate Something with Photos

1. Go to http://localhost:3000
2. Click "Rate Now"
3. Choose "Rate a Neighborhood"
4. Fill in all fields
5. Upload 1-2 photos
6. Click "Submit Rating"

### Step 2: Check Console

Open browser console (F12) and look for:
```
Uploaded image URLs: [
  "https://tqxomrvaiaidblwdvonu.supabase.co/storage/v1/object/public/neighborhood-images/neighborhoods/..."
]
```

### Step 3: Verify in Supabase

1. Go to Supabase Dashboard
2. Storage → neighborhood-images
3. You should see: `neighborhoods/{user-id}/{timestamp}-{filename}`
4. Click the file → Copy URL
5. Paste in browser - image should load!

---

## 📊 Troubleshooting

### Images Not Uploading
```
Problem: Error in console
Solution:
1. Check buckets are PUBLIC
2. Check policies are set
3. Verify user is logged in
```

### Images Upload But Don't Display
```
Problem: Broken image links
Solution:
1. Check browser console for image URLs
2. Copy URL and test in new tab
3. Verify bucket is PUBLIC
4. Check CORS is enabled
```

### "Error: Bucket not found"
```
Problem: Buckets don't exist
Solution:
1. Go to Storage in Supabase
2. Create both buckets
3. Make them PUBLIC
4. Set policies
```

### "Error: Permission denied"
```
Problem: Missing policies
Solution:
1. Go to bucket → Policies
2. Add all 4 policies for each bucket
3. Make sure PUBLIC read is enabled
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `neighborhood-images` bucket exists
- [ ] `neighborhood-images` is PUBLIC (check box ticked)
- [ ] `building-images` bucket exists
- [ ] `building-images` is PUBLIC (check box ticked)
- [ ] Public read policy for both buckets
- [ ] Authenticated upload policy for both buckets
- [ ] Can upload images when rating
- [ ] Images appear on homepage cards
- [ ] Images appear on explore page
- [ ] Images appear on detail pages
- [ ] Console shows image URLs
- [ ] URLs open in new tab

---

## 🎉 Once Set Up Correctly

**Images Will:**
- ✅ Upload when you rate
- ✅ Store in organized folders
- ✅ Generate public URLs
- ✅ Display on homepage
- ✅ Display on explore page
- ✅ Display on detail pages
- ✅ Be accessible to everyone
- ✅ Load fast with caching

---

## 🚀 Quick Test

1. **Set up storage** (follow steps above)
2. **Rate with photo**
3. **Check homepage** - your photo shows!
4. **Check explore** - photo there too!
5. **Click card** - full image gallery!

---

**Need help?** Check browser console for errors or Supabase logs in dashboard.

**Important:** Storage MUST be PUBLIC or images won't display to visitors!

