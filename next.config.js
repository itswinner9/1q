/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tqxomrvaiaidblwdvonu.supabase.co'],
  },
  eslint: {
    // Allow build to succeed even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow build to succeed even with type errors (not recommended for production)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

