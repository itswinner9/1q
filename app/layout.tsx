import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NeighborhoodRank | Find Your Perfect Neighborhood & Apartment in Canada',
    template: '%s | NeighborhoodRank'
  },
  description: 'Discover the best neighborhoods and apartments in Canada with real reviews from residents. Compare safety, cleanliness, noise levels, transit access, management quality, and more. Make informed housing decisions with NeighborhoodRank.',
  keywords: 'neighborhood reviews, apartment reviews, building ratings, Canada housing, rental reviews, neighborhood ratings, apartment ratings, condo reviews, tenant reviews, neighborhood safety, best neighborhoods Canada',
  authors: [{ name: 'NeighborhoodRank' }],
  creator: 'NeighborhoodRank',
  publisher: 'NeighborhoodRank',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://neighborhoodrank.com'),
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://neighborhoodrank.com',
    siteName: 'NeighborhoodRank',
    title: 'NeighborhoodRank | Real Neighborhood & Apartment Reviews',
    description: 'Find your perfect neighborhood or apartment with verified reviews from real residents across Canada.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeighborhoodRank - Find Your Perfect Place'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeighborhoodRank | Real Neighborhood & Apartment Reviews',
    description: 'Find your perfect neighborhood or apartment with verified reviews from real residents.',
    images: ['/og-image.jpg']
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
        <link rel="canonical" href="https://neighborhoodrank.com" />
      </head>
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
