# 🚀 Deploy LivRank to Netlify

## ✅ Pre-Deployment Checklist

Before deploying, make sure you've completed:

- [ ] Run `LIVRANK_COMPLETE_DB.sql` in Supabase
- [ ] Create storage buckets (neighborhood-images, building-images, review-images)
- [ ] Set up storage policies
- [ ] Test locally at http://localhost:3001
- [ ] Verify login/signup works
- [ ] Verify rating submission works

---

## 📋 Step 1: Build Locally (Test First)

```bash
npm run build
```

**Expected output:**
- ✅ Compiled successfully
- ✅ No errors
- ✅ Creates `.next` folder

**If build fails:**
- Check console for errors
- Fix TypeScript errors
- Fix import errors
- Try again

---

## 🌐 Step 2: Deploy to Netlify

### Option A: Deploy via Netlify CLI (Fastest)

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Follow prompts:**
1. Create new site? → **Yes**
2. Team → Select your team
3. Site name → **livrank** (or your choice)
4. Publish directory → **`.next`**

---

### Option B: Deploy via Netlify Dashboard (Recommended)

1. **Go to:** https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub/GitLab/Bitbucket**
4. Select your repository
5. Configure build settings:

**Build Settings:**
```
Base directory: (leave empty)
Build command: npm run build
Publish directory: .next
```

6. Click **"Deploy site"**

---

## 🔐 Step 3: Add Environment Variables

After deployment, add these environment variables:

1. Go to: **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add these **3 variables**:

```env
NEXT_PUBLIC_SUPABASE_URL
Value: https://eehtzdpzbjsuendgwnwy.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlaHR6ZHB6YmpzdWVuZGd3bnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNDQ5ODgsImV4cCI6MjA3NTgyMDk4OH0.4YjQFYHSPF2EVEqwk544ulaOkGYLvpogbSyfYKYbIOpQ

NEXT_PUBLIC_MAPBOX_TOKEN
Value: [your-mapbox-token]
```

4. Click **"Save"**
5. **Trigger redeploy** (important!)

---

## 🔄 Step 4: Redeploy with Environment Variables

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete (~2 minutes)
4. Your site is live! 🎉

---

## 🌍 Step 5: Custom Domain (Optional)

### Add your domain:

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter: `livrank.ca` (or your domain)
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

### DNS Settings (for livrank.ca):

**A Record:**
```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's IP)
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: [your-site].netlify.app
```

---

## ✅ Step 6: Verify Deployment

Visit your site: `https://[your-site].netlify.app`

**Test these:**
1. ✅ Home page loads
2. ✅ Rotating text animation works
3. ✅ Login works
4. ✅ Signup works
5. ✅ Search works
6. ✅ Rating submission works
7. ✅ Admin panel works (for admins)
8. ✅ Profile page works

---

## 🐛 Troubleshooting

### Build fails on Netlify:

**Error: "Module not found"**
→ Make sure all dependencies are in `package.json`
→ Run `npm install` locally first

**Error: TypeScript errors**
→ Fix errors locally
→ Run `npm run build` locally
→ Push fixes, redeploy

**Error: Environment variables not found**
→ Add them in Netlify dashboard
→ Trigger redeploy

### Site loads but features don't work:

**Login doesn't work:**
→ Check environment variables are correct
→ Check Supabase project is active
→ Check browser console for errors

**Images don't load:**
→ Check storage buckets exist
→ Check storage policies
→ Check image URLs are correct

**Ratings don't submit:**
→ Check database tables exist
→ Run `LIVRANK_COMPLETE_DB.sql`
→ Check RLS policies

---

## 📊 Netlify Configuration Files

### netlify.toml (Already configured)

Your site will automatically use these settings from `next.config.js`

---

## 🔧 Post-Deployment Setup

### 1. Update Supabase Redirect URLs:

1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add your Netlify URL:
   - Site URL: `https://[your-site].netlify.app`
   - Redirect URLs: `https://[your-site].netlify.app/**`

### 2. Generate Sitemap:

After deployment, generate sitemap:

```bash
npm run sitemap
```

This creates:
- `public/sitemap.xml`
- `public/robots.txt`

Commit and push to trigger redeploy.

### 3. Submit to Google:

1. Go to: https://search.google.com/search-console
2. Add property: `https://livrank.ca`
3. Verify ownership
4. Submit sitemap: `https://livrank.ca/sitemap.xml`

---

## 🎯 Success Checklist

After deployment, verify:

- [ ] Site is live and accessible
- [ ] Home page loads with animations
- [ ] Login/signup works
- [ ] Rating submission works
- [ ] Search works
- [ ] Admin panel works
- [ ] Images load
- [ ] Stats show real numbers
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain working (if added)

---

## 🚀 Continuous Deployment

Netlify will automatically redeploy when you push to your repository!

**Workflow:**
1. Make changes locally
2. Test: `npm run dev`
3. Build: `npm run build`
4. Commit: `git commit -am "Update"`
5. Push: `git push origin main`
6. Netlify auto-deploys! 🎉

---

## 📞 Need Help?

**Common Issues:**

1. **Build fails:** Check `npm run build` locally first
2. **Login fails:** Check environment variables
3. **404 errors:** Check Next.js routing
4. **Slow load:** Enable caching in Netlify

**Netlify Support:**
- Docs: https://docs.netlify.com
- Community: https://answers.netlify.com

---

## 🎉 You're Live!

Your LivRank site is now deployed and accessible worldwide!

**Share it:**
- Tweet about it
- Share on Reddit
- Add to your portfolio
- Get feedback from users

**Next Steps:**
- Monitor analytics
- Add more features
- Optimize performance
- Get user feedback

---

**LivRank is live! 🚀🇨🇦**


