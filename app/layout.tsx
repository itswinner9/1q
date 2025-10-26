import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'LivRank | Real Reviews for Buildings, Landlords, and Neighborhoods',
    template: '%s | LivRank'
  },
  description: 'Discover honest reviews about apartments, neighborhoods, and landlords across Canada. See what real tenants say on LivRank - the trusted community for housing reviews.',
  keywords: 'apartment reviews, landlord reviews, neighborhood reviews, building ratings, Canada housing, rental reviews, tenant reviews, condo reviews, property management reviews, neighborhood safety, best neighborhoods Canada, landlord ratings, apartment ratings',
  authors: [{ name: 'LivRank' }],
  creator: 'LivRank',
  publisher: 'LivRank',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://livrank.ca'),
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://livrank.ca',
    siteName: 'LivRank',
    title: 'LivRank | Apartment & Neighborhood Ratings',
    description: 'Rate and explore buildings, landlords, and neighborhoods in your city. Trusted by tenants across Canada.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LivRank - Real Reviews from Real Tenants'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LivRank | Apartment & Neighborhood Ratings',
    description: 'Rate and explore buildings, landlords, and neighborhoods. Trusted by tenants across Canada.',
    images: ['/og-image.png'],
    site: '@livrank',
    creator: '@livrank'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add when you get these
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://livrank.ca',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-CA">
      <head>
        {/* Additional SEO tags */}
        <meta name="theme-color" content="#f97316" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LivRank" />
        {/* Preconnect to Supabase for faster loading */}
        <link rel="preconnect" href="https://eehtzdpzbjsuendgwnwy.supabase.co" />
        <link rel="dns-prefetch" href="https://eehtzdpzbjsuendgwnwy.supabase.co" />
      </head>
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
