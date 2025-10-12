# Quick Start Guide

Get NeighborhoodRank running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier works great)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Name it "NeighborhoodRank"
4. Set a strong database password
5. Choose your region
6. Click "Create new project"
7. Wait 1-2 minutes for setup to complete

### 2.2 Run Database Setup

1. In Supabase dashboard, go to **SQL Editor**
2. Copy all the SQL from `SUPABASE_SETUP.md` (Step 2)
3. Paste into SQL Editor
4. Click **Run**
5. You should see "Success" messages

### 2.3 Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Create bucket: `neighborhood-images` (make it **public**)
4. Create bucket: `building-images` (make it **public**)

### 2.4 Get API Keys

1. Go to **Settings** → **API** in Supabase
2. Copy your **Project URL**
3. Copy your **anon/public** key

## Step 3: Configure Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=paste-your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

## Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test It Out

1. **Sign Up** - Create a new account
2. **Click "Rate Now"** - Choose between Neighborhood or Building
3. **Fill out the form** - Rate all categories and optionally add photos
4. **Submit** - Your rating will appear on the Explore page!

## Troubleshooting

### "Invalid API credentials"
- Check that your `.env.local` has the correct Supabase URL and key
- Make sure there are no extra spaces
- Restart the dev server: `Ctrl+C` then `npm run dev`

### "Permission denied" when uploading images
- Make sure both storage buckets are set to **public**
- Check the storage policies in Supabase

### Can't sign up
- Check that Email auth is enabled in Supabase: **Authentication** → **Providers** → **Email**
- For testing, disable email confirmation: **Authentication** → **Settings** → uncheck "Enable email confirmations"

### Page shows "Not Found"
- Make sure all database tables were created successfully
- Check Supabase logs for errors

## What's Next?

- Explore the codebase in `app/` and `components/`
- Customize colors in `tailwind.config.ts`
- Add more features!
- Deploy to production (see `DEPLOYMENT.md`)

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Check for linting errors
npm run lint
```

## Project Structure

```
app/
├── page.tsx                 # Homepage
├── explore/                 # Browse ratings
├── rate/                    # Rating forms
│   ├── neighborhood/
│   └── building/
├── login/                   # Login page
├── signup/                  # Sign up page
└── profile/                 # User profile

components/
├── Navigation.tsx           # Top navigation bar
├── RateModal.tsx           # Choice modal
└── StarRating.tsx          # Star rating component

lib/
└── supabase.ts             # Supabase client & types
```

## Need Help?

- Check the full [README.md](README.md) for detailed information
- Review [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for database setup
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Tips

1. **Disable Email Confirmation for Development**
   - Supabase → Authentication → Settings
   - Uncheck "Enable email confirmations"
   - You can enable it later for production

2. **View Your Data**
   - Go to Table Editor in Supabase to see all ratings
   - Storage to see uploaded images

3. **Make It Yours**
   - Change colors in `tailwind.config.ts`
   - Update the logo and branding in `components/Navigation.tsx`
   - Add custom categories in the rating forms

Enjoy building with NeighborhoodRank! 🏘️⭐

