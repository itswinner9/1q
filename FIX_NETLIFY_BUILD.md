# 🚨 FIX NETLIFY BUILD ERROR

## The Error:
"Error: supabaseUrl is required"

## The Cause:
Netlify doesn't have your environment variables set!

## THE FIX (2 Minutes):

### Step 1: Go to Netlify Dashboard
1. Go to: https://app.netlify.com/
2. Click on your site
3. Click "Site settings" (or "Site configuration")

### Step 2: Add Environment Variables
1. Find "Environment variables" in the left menu
2. Click "Add a variable" or "Add environment variables"
3. Add these THREE variables:

**Variable 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://tqxomrvaiaidblwdvonu.supabase.co`

**Variable 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeG9tcnZhaWFpZGJsd2R2b251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTM0MjIsImV4cCI6MjA3NTc2OTQyMn0.BS4Wp5lNSclPw5fxtfykI2l7HuAtPm4zzHqEyVmCXQc`

**Variable 3:**
- Key: `NEXT_PUBLIC_MAPBOX_TOKEN`
- Value: `pk.eyJ1Ijoic2FhYW11c2UiLCJhIjoiY21nbW92aGhnMWsybDJvb2Vha3VudW1lNyJ9.WiiM88O6xOL_aA2y-4LYqw`

### Step 3: Redeploy
1. Go to "Deploys" tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait 2-3 minutes
4. Build will succeed!

## That's It!

The build was failing because it tried to use Supabase but couldn't find the URL/key.
After adding the environment variables, it will work!

---

## Quick Checklist:
- [ ] Go to Netlify dashboard
- [ ] Site settings → Environment variables
- [ ] Add NEXT_PUBLIC_SUPABASE_URL
- [ ] Add NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Add NEXT_PUBLIC_MAPBOX_TOKEN
- [ ] Trigger redeploy
- [ ] Wait for build to complete
- [ ] Visit your site!

