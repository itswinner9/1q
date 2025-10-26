# Setup Supabase Storage Buckets for Image Uploads

## ❌ Error: "Bucket not found"

This means you need to create storage buckets in Supabase for image uploads.

---

## 🪣 **CREATE STORAGE BUCKETS**

### **Step 1: Go to Supabase Storage**

1. Visit: https://app.supabase.com
2. Select your project: `eehtzdpzbjsuendgwnwy`
3. Click **"Storage"** in the left sidebar
4. Click **"Create a new bucket"** button

---

### **Step 2: Create Neighborhood Images Bucket**

1. **Bucket name:** `neighborhood-images`
2. **Public bucket:** ✅ **YES** (Check this box)
3. **File size limit:** `50 MB`
4. **Allowed MIME types:** Leave empty (allow all image types)
5. Click **"Create bucket"**

---

### **Step 3: Create Building Images Bucket**

1. Click **"Create a new bucket"** again
2. **Bucket name:** `building-images`
3. **Public bucket:** ✅ **YES** (Check this box)
4. **File size limit:** `50 MB`
5. **Allowed MIME types:** Leave empty
6. Click **"Create bucket"**

---

### **Step 4: Create Review Images Bucket**

1. Click **"Create a new bucket"** again
2. **Bucket name:** `review-images`
3. **Public bucket:** ✅ **YES** (Check this box)
4. **File size limit:** `50 MB`
5. **Allowed MIME types:** Leave empty
6. Click **"Create bucket"**

---

## 🔒 **SET STORAGE POLICIES**

For each bucket, you need to set policies:

### **For ALL Buckets (neighborhood-images, building-images, review-images):**

1. Click on the bucket name
2. Click **"Policies"** tab
3. Click **"New Policy"**

---

### **Policy 1: Public Read Access**

```
Policy Name: Public read access
Allowed Operations: SELECT
Target Roles: public
USING expression: true
```

Click **"Save"**

---

### **Policy 2: Authenticated Upload**

```
Policy Name: Authenticated users can upload
Allowed Operations: INSERT
Target Roles: authenticated
WITH CHECK expression: (auth.uid() IS NOT NULL)
```

Click **"Save"**

---

### **Policy 3: Users Can Update Own Files**

```
Policy Name: Users can update own files
Allowed Operations: UPDATE
Target Roles: authenticated
USING expression: (auth.uid() = owner)
```

Click **"Save"**

---

### **Policy 4: Admins Can Delete**

```
Policy Name: Admins can delete any file
Allowed Operations: DELETE
Target Roles: authenticated
USING expression: EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid() AND is_admin = true
)
```

Click **"Save"**

---

## ✅ **VERIFY SETUP**

After creating buckets, verify they exist:

1. Go to **Storage** in Supabase
2. You should see 3 buckets:
   - ✅ `neighborhood-images` (Public)
   - ✅ `building-images` (Public)
   - ✅ `review-images` (Public)
3. Each should have 4 policies

---

## 🧪 **TEST UPLOAD**

1. Login as admin: http://localhost:3000/login
2. Go to: http://localhost:3000/admin/neighborhoods
3. Click "Upload Cover" on any neighborhood
4. Select an image file
5. Should upload successfully!
6. Image should appear immediately

---

## 🔧 **Alternative: SQL Method**

If you prefer SQL, run this in Supabase SQL Editor:

```sql
-- Note: Storage buckets can't be created via SQL
-- You MUST use the Supabase Dashboard UI to create them
-- But you can set up policies via SQL after creating buckets

-- For neighborhood-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('neighborhood-images', 'neighborhood-images', true)
ON CONFLICT (id) DO NOTHING;

-- For building-images bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('building-images', 'building-images', true)
ON CONFLICT (id) DO NOTHING;

-- For review-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set policies for neighborhood-images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'neighborhood-images');

CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'neighborhood-images' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'neighborhood-images' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Repeat similar policies for building-images and review-images
```

---

## 📝 **QUICK SUMMARY**

**What you need to do:**

1. ✅ Go to Supabase → Storage
2. ✅ Create 3 buckets (all PUBLIC):
   - `neighborhood-images`
   - `building-images`
   - `review-images`
3. ✅ Set policies for each bucket
4. ✅ Test upload in admin panel

**Then cover uploads will work!** 🎉

---

## 🆘 **Troubleshooting**

### **Still getting "Bucket not found"?**
- Make sure bucket names are EXACTLY: `neighborhood-images`, `building-images`, `review-images`
- Check they are marked as PUBLIC
- Refresh your browser

### **Upload works but image doesn't show?**
- Check bucket is PUBLIC
- Check "Public read access" policy exists
- Check file was actually uploaded (view in Storage)

### **Permission denied?**
- Make sure you're logged in
- Check "Authenticated upload" policy exists
- Verify user is admin for admin uploads

---

**Create the buckets now and try uploading again!** 🪣✨


