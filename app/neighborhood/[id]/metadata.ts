import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { 
  generateNeighborhoodTitle, 
  generateNeighborhoodDescription,
  generateKeywords,
  generateOGImage
} from '@/lib/seo'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch neighborhood data
  const { data: neighborhood } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!neighborhood) {
    return {
      title: 'Neighborhood Not Found | NeighborhoodRank',
      description: 'The neighborhood you are looking for could not be found.'
    }
  }

  // Fetch reviews count
  const { data: reviews } = await supabase
    .from('neighborhood_reviews')
    .select('id')
    .eq('neighborhood_id', params.id)

  const reviewCount = reviews?.length || neighborhood.total_reviews || 0
  const rating = neighborhood.average_rating

  const title = generateNeighborhoodTitle(neighborhood.name, neighborhood.city, neighborhood.province, rating)
  const description = generateNeighborhoodDescription(
    neighborhood.name,
    neighborhood.city,
    neighborhood.province,
    rating,
    reviewCount
  )
  const keywords = generateKeywords('neighborhood', neighborhood.name, neighborhood.city)

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_CA',
      url: `https://neighborhoodrank.com/neighborhood/${params.id}`,
      siteName: 'NeighborhoodRank',
      images: [
        {
          url: generateOGImage(neighborhood.images || null),
          width: 1200,
          height: 630,
          alt: `${neighborhood.name} in ${neighborhood.city}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [generateOGImage(neighborhood.images || null)]
    },
    alternates: {
      canonical: `https://neighborhoodrank.com/neighborhood/${params.id}`
    }
  }
}

