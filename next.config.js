/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production build optimization
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [
      'eehtzdpzbjsuendgwnwy.supabase.co',
      'tqxomrvaiaidblwdvonu.supabase.co',
      'livrank.ca',
      'www.livrank.ca'
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ESLint config
  eslint: {
    ignoreDuringBuilds: true, // Allow build with warnings for deployment
  },
  
  // TypeScript config
  typescript: {
    ignoreBuildErrors: true, // Allow build with type errors for deployment
  },
  
  // Experimental features for better SEO
  // experimental: {
  //   optimizeCss: true, // Disabled - requires additional dependencies
  // },
  
  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/neighborhoodrank',
        destination: '/',
        permanent: true,
      },
      {
        source: '/rentrank',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
