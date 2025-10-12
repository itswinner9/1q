# Deployment Guide

This guide will help you deploy NeighborhoodRank to production.

## Prerequisites

- Supabase project set up (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
- GitHub repository with your code
- Vercel account (recommended) or another hosting platform

## Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/neighborhoodrank.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Add Environment Variables

In the Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

### Step 5: Update Supabase Settings

1. Go to your Supabase project dashboard
2. Navigate to Authentication > URL Configuration
3. Add your Vercel domain to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### Step 6: Update next.config.js

Update the image domains in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project-ref.supabase.co'],
  },
}

module.exports = nextConfig
```

Commit and push this change to trigger a redeployment.

## Deploy to Other Platforms

### Netlify

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Railway will auto-detect Next.js and deploy

### Self-Hosted (VPS/Cloud)

Requirements:
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx for reverse proxy

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "neighborhoodrank" -- start

# Configure Nginx
# Add reverse proxy configuration to point to localhost:3000
```

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test creating neighborhood ratings
- [ ] Test creating building ratings
- [ ] Test image uploads
- [ ] Test search functionality
- [ ] Verify all pages load correctly
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify Supabase connection
- [ ] Set up monitoring (Vercel Analytics, Sentry, etc.)
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic on Vercel)
- [ ] Enable email confirmations in Supabase
- [ ] Configure SMTP for production emails

## Environment Variables Reference

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Your Supabase anonymous key
```

### Optional Variables

```env
NEXT_PUBLIC_SITE_URL=              # Your production URL (for SEO)
NEXT_PUBLIC_GA_ID=                 # Google Analytics ID (if using)
```

## Performance Optimization

### Enable Next.js Image Optimization

Update `next.config.js` to optimize images from Supabase:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project-ref.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
```

### Enable Caching

Vercel automatically handles caching for Next.js applications.

For other platforms, configure:
- Static assets: Cache for 1 year
- API routes: Cache based on your needs
- Pages: ISR (Incremental Static Regeneration) where appropriate

## Monitoring and Analytics

### Vercel Analytics

Enable in your Vercel dashboard:
1. Go to your project settings
2. Navigate to Analytics
3. Enable Vercel Analytics

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Follow the wizard to configure Sentry.

### Database Monitoring

Monitor your Supabase database:
1. Check the Supabase dashboard regularly
2. Set up alerts for high usage
3. Monitor API request patterns
4. Review and optimize slow queries

## Scaling Considerations

As your app grows:

1. **Database**
   - Upgrade Supabase plan if needed
   - Add database indexes for frequently queried fields
   - Consider read replicas for high traffic

2. **Storage**
   - Monitor storage usage in Supabase
   - Implement image compression before upload
   - Set up CDN for faster image delivery

3. **Authentication**
   - Monitor concurrent users
   - Upgrade Supabase plan if needed
   - Implement rate limiting

4. **Hosting**
   - Upgrade Vercel plan if needed
   - Monitor bandwidth and function invocations
   - Consider edge functions for global performance

## Backup Strategy

### Database Backups

Supabase Pro includes:
- Daily automated backups
- Point-in-time recovery
- Manual backup snapshots

### Code Backups

- Keep code in GitHub
- Tag releases: `git tag v1.0.0`
- Maintain production branch

## Troubleshooting Deployment Issues

### Build Fails

- Check Node.js version matches locally
- Verify all dependencies are in package.json
- Check build logs for specific errors
- Try building locally: `npm run build`

### Images Not Loading

- Verify Supabase storage bucket is public
- Check next.config.js domains configuration
- Verify storage policies in Supabase

### Authentication Issues

- Verify environment variables are set correctly
- Check Supabase URL configuration
- Verify redirect URLs include production domain

### Database Connection Issues

- Verify Supabase credentials
- Check Row Level Security policies
- Review Supabase logs for errors

## Custom Domain Setup

### Vercel

1. Go to project settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (can take 24-48 hours)

### Update Supabase

After setting up custom domain:
1. Update Site URL in Supabase
2. Add custom domain to Redirect URLs
3. Test authentication with new domain

## Security Best Practices

- [ ] Never commit `.env.local` to Git
- [ ] Use environment variables for all secrets
- [ ] Keep dependencies updated: `npm audit`
- [ ] Enable Supabase Row Level Security
- [ ] Use HTTPS only (automatic on Vercel)
- [ ] Implement rate limiting for API routes
- [ ] Set up CORS properly
- [ ] Review and audit security regularly

---

Need help? Create an issue on GitHub or check the [Next.js deployment docs](https://nextjs.org/docs/deployment).

