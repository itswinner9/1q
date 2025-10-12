import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { 
  generateBuildingTitle, 
  generateBuildingDescription,
  generateKeywords,
  generateOGImage
} from '@/lib/seo'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch building data
  const { data: building } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!building) {
    return {
      title: 'Building Not Found | NeighborhoodRank',
      description: 'The building you are looking for could not be found.'
    }
  }

  // Fetch reviews count
  const { data: reviews } = await supabase
    .from('building_reviews')
    .select('id')
    .eq('building_id', params.id)

  const reviewCount = reviews?.length || building.total_reviews || 0
  const rating = building.average_rating

  const title = generateBuildingTitle(building.name, building.city, rating)
  const description = generateBuildingDescription(
    building.name,
    building.address,
    building.city,
    building.province,
    rating,
    reviewCount
  )
  const keywords = generateKeywords('building', building.name, building.city)

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_CA',
      url: `https://neighborhoodrank.com/building/${params.id}`,
      siteName: 'NeighborhoodRank',
      images: [
        {
          url: generateOGImage(building.images || null),
          width: 1200,
          height: 630,
          alt: `${building.name} in ${building.city}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [generateOGImage(building.images || null)]
    },
    alternates: {
      canonical: `https://neighborhoodrank.com/building/${params.id}`
    }
  }
}

