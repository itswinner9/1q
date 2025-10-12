# 🚀 Deploy NeighborhoodRank to Netlify

## Prerequisites
- GitHub account
- Netlify account (free)
- Your Supabase project ready

---

## Step 1: Prepare Your Code

### 1.1 Make sure you have a Git repository

```bash
# Initialize git if you haven't
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - NeighborhoodRank"
```

### 1.2 Push to GitHub

```bash
# Create a new repository on GitHub (e.g., "neighborhoodrank")
# Then:
git remote add origin https://github.com/YOUR_USERNAME/neighborhoodrank.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Netlify

### 2.1 Go to Netlify
1. Visit: https://www.netlify.com/
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"

### 2.2 Connect GitHub Repository
1. Choose "GitHub"
2. Authorize Netlify
3. Select your "neighborhoodrank" repository

### 2.3 Configure Build Settings

**Build settings:**
- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: (leave empty)

**Environment variables** (CRITICAL!):
Click "Add environment variables":

```
NEXT_PUBLIC_SUPABASE_URL=https://tqxomrvaiaidblwdvonu.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeG9tcnZhaWFpZGJsd2R2b251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTM0MjIsImV4cCI6MjA3NTc2OTQyMn0.BS4Wp5lNSclPw5fxtfykI2l7HuAtPm4zzHqEyVmCXQc

NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoic2FhYW11c2UiLCJhIjoiY21nbW92aGhnMWsybDJvb2Vha3VudW1lNyJ9.WiiM88O6xOL_aA2y-4LYqw
```

### 2.4 Deploy
1. Click "Deploy site"
2. Wait 2-5 minutes for build to complete
3. You'll get a URL like: `https://your-site-name.netlify.app`

---

## Step 3: Configure Supabase for Production

### 3.1 Add Netlify URL to Supabase

1. Go to Supabase Dashboard
2. Click your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Netlify URL to:
   - Site URL: `https://your-site-name.netlify.app`
   - Redirect URLs: `https://your-site-name.netlify.app/**`

### 3.2 Update Image Domains

In `next.config.js`, your Supabase domain is already configured:
```javascript
images: {
  domains: ['tqxomrvaiaidblwdvonu.supabase.co'],
}
```

---

## Step 4: Test Your Deployment

1. Visit your Netlify URL
2. Try signing up
3. Try logging in
4. Try submitting a rating
5. Check admin panel (if you're admin)

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally first

**Error: "Environment variables not set"**
- Check Netlify dashboard → Site settings → Environment variables
- Make sure all 3 variables are added
- Redeploy after adding variables

### Login Not Working on Production

1. Check Supabase URL configuration
2. Make sure Netlify URL is in Supabase redirect URLs
3. Check browser console for errors

### Images Not Loading

1. Check `next.config.js` has Supabase domain
2. Make sure images are uploaded to Supabase Storage
3. Check Supabase Storage bucket is public

---

## Custom Domain (Optional)

### Add Your Own Domain

1. In Netlify: Domain settings → Add custom domain
2. Follow DNS instructions
3. Wait for SSL certificate (automatic)

---

## Continuous Deployment

Every time you push to GitHub:
1. Netlify automatically detects the push
2. Runs `npm run build`
3. Deploys new version
4. Takes 2-5 minutes

**No manual deployment needed!**

---

## Important Notes

### Environment Variables
- Never commit `.env.local` to GitHub (it's in `.gitignore`)
- Always set environment variables in Netlify dashboard
- Redeploy after changing environment variables

### Database
- Use the SAME Supabase project for local and production
- Or create a separate production database

### Images
- Upload to Supabase Storage (not local files)
- Supabase Storage URLs work in both local and production

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify connected to GitHub repo
- [ ] Build command set: `npm run build`
- [ ] Publish directory set: `.next`
- [ ] Environment variables added (all 3)
- [ ] Supabase URL configuration updated
- [ ] Database tables created (run CLEAN_DATABASE_SETUP.sql)
- [ ] Admin users set
- [ ] Site deployed successfully
- [ ] Login works on production
- [ ] Rating submission works
- [ ] Admin panel accessible

---

**Your site will be live at: `https://your-site-name.netlify.app`** 🚀

