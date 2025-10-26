// SEO Utilities for LivRank
// Generates slugs, structured data, and meta content for buildings, neighborhoods, and landlords

/**
 * Generate SEO-friendly slug from location name and city
 * Example: "King George, Surrey" → "king-george-surrey"
 */
export function generateSlug(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
}

/**
 * Generate JSON-LD structured data for neighborhoods
 * This helps Google show rich snippets with ratings
 */
export function generateNeighborhoodStructuredData(neighborhood: any, reviews: any[] = []) {
  const reviewCount = reviews.length || neighborhood.total_reviews || 0
  const averageRating = neighborhood.average_rating || 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${neighborhood.name}, ${neighborhood.city}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: neighborhood.city,
      addressRegion: neighborhood.province,
      addressCountry: 'CA'
    },
    geo: neighborhood.latitude && neighborhood.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: neighborhood.latitude,
      longitude: neighborhood.longitude
    } : undefined,
    aggregateRating: reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: reviewCount
    } : undefined,
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.is_anonymous ? 'Anonymous User' : (review.display_name || 'User')
      },
      datePublished: review.created_at,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: ((review.safety + review.cleanliness + review.noise + review.community + review.transit + review.amenities) / 6).toFixed(1),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: review.comment || ''
    })).filter(r => r.reviewBody)
  }
}

/**
 * Generate JSON-LD structured data for buildings
 */
export function generateBuildingStructuredData(building: any, reviews: any[] = []) {
  const reviewCount = reviews.length || building.total_reviews || 0
  const averageRating = building.average_rating || 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: building.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: building.address,
      addressLocality: building.city,
      addressRegion: building.province,
      addressCountry: 'CA'
    },
    geo: building.latitude && building.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: building.latitude,
      longitude: building.longitude
    } : undefined,
    aggregateRating: reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: reviewCount
    } : undefined,
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.is_anonymous ? 'Anonymous User' : (review.display_name || 'User')
      },
      datePublished: review.created_at,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: ((review.management + review.cleanliness + review.maintenance + review.rent_value + review.noise + review.amenities) / 6).toFixed(1),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: review.comment || ''
    })).filter(r => r.reviewBody)
  }
}

/**
 * Generate dynamic page title for neighborhoods
 */
export function generateNeighborhoodTitle(name: string, city: string, province: string, rating?: number): string {
  const ratingText = rating ? ` - ${rating.toFixed(1)} ⭐` : ''
  return `${name}, ${city} Reviews & Ratings${ratingText} | LivRank`
}

/**
 * Generate dynamic meta description for neighborhoods
 */
export function generateNeighborhoodDescription(
  name: string, 
  city: string, 
  province: string, 
  rating?: number,
  reviewCount?: number
): string {
  const reviews = reviewCount ? ` Read ${reviewCount} verified ${reviewCount === 1 ? 'review' : 'reviews'}` : ''
  const ratingText = rating ? ` Rated ${rating.toFixed(1)}/5.0.` : ''
  
  return `${name} in ${city}, ${province} - Real resident reviews and ratings.${ratingText}${reviews} covering Safety, Cleanliness, Noise, Community, Transit Access, and Amenities. Find out if this is the perfect neighborhood for you.`
}

/**
 * Generate dynamic page title for buildings
 */
export function generateBuildingTitle(name: string, city: string, rating?: number): string {
  const ratingText = rating ? ` - ${rating.toFixed(1)} ⭐` : ''
  return `${name} Reviews${ratingText} | Apartment & Condo Ratings in ${city} | LivRank`
}

/**
 * Generate dynamic meta description for buildings
 */
export function generateBuildingDescription(
  name: string,
  address: string,
  city: string,
  province: string,
  rating?: number,
  reviewCount?: number
): string {
  const reviews = reviewCount ? ` See ${reviewCount} verified ${reviewCount === 1 ? 'review' : 'reviews'}` : ''
  const ratingText = rating ? ` Average rating: ${rating.toFixed(1)}/5.0.` : ''
  
  return `${name} at ${address} in ${city}, ${province}.${ratingText}${reviews} about Management, Maintenance, Rent Value, Cleanliness, Noise, and Amenities. Real tenant reviews to help you make the right choice.`
}

/**
 * Generate keywords for SEO
 */
export function generateKeywords(type: 'neighborhood' | 'building', name: string, city: string): string {
  const base = [
    `${name}`,
    `${city}`,
    `${name} ${city}`,
    `${name} reviews`,
    `${city} reviews`
  ]

  if (type === 'neighborhood') {
    return [
      ...base,
      `${name} neighborhood`,
      `${name} safety`,
      `${city} neighborhoods`,
      `best neighborhoods ${city}`,
      `${name} transit`,
      `${name} community`,
      'neighborhood reviews',
      'neighborhood ratings'
    ].join(', ')
  } else {
    return [
      ...base,
      `${name} apartments`,
      `${name} building`,
      `${city} apartments`,
      `${city} condos`,
      `${name} rent`,
      `${name} management`,
      'apartment reviews',
      'building ratings',
      'condo reviews'
    ].join(', ')
  }
}

/**
 * Generate Open Graph image URL
 * Falls back to a default if no image provided
 */
export function generateOGImage(images: string[] | null | undefined): string {
  if (images && images.length > 0) {
    return images[0]
  }
  // Default OG image - you can create a custom one later
  return '/og-default.jpg'
}

/**
 * Generate JSON-LD structured data for landlords
 */
export function generateLandlordStructuredData(landlord: any, reviews: any[] = []) {
  const reviewCount = reviews.length || landlord.total_reviews || 0
  const averageRating = landlord.average_rating || 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: landlord.name,
    url: landlord.website || undefined,
    telephone: landlord.phone || undefined,
    aggregateRating: reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: reviewCount
    } : undefined,
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.is_anonymous ? 'Anonymous User' : (review.display_name || 'User')
      },
      datePublished: review.created_at,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: ((review.management + review.cleanliness + review.maintenance + review.rent_value + review.noise + review.amenities) / 6).toFixed(1),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: review.comment || ''
    })).filter(r => r.reviewBody)
  }
}

/**
 * Generate dynamic page title for landlords
 */
export function generateLandlordTitle(name: string, rating?: number): string {
  const ratingText = rating ? ` - ${rating.toFixed(1)} ⭐` : ''
  return `${name} Reviews${ratingText} | Landlord & Property Management Ratings | LivRank`
}

/**
 * Generate dynamic meta description for landlords
 */
export function generateLandlordDescription(
  name: string,
  rating?: number,
  reviewCount?: number,
  buildingCount?: number
): string {
  const reviews = reviewCount ? ` Read ${reviewCount} verified ${reviewCount === 1 ? 'review' : 'reviews'}` : ''
  const ratingText = rating ? ` Rated ${rating.toFixed(1)}/5.0.` : ''
  const buildings = buildingCount ? ` Manages ${buildingCount} ${buildingCount === 1 ? 'building' : 'buildings'}.` : ''
  
  return `${name} landlord and property management reviews.${ratingText}${reviews}${buildings} See what real tenants say about responsiveness, maintenance, rent value, and more. Make informed decisions with LivRank.`
}

/**
 * Generate JSON-LD structured data for discussion threads (Reddit-style)
 */
export function generateDiscussionStructuredData(discussion: any, replies: any[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: discussion.topic,
    text: discussion.body,
    author: {
      '@type': 'Person',
      name: discussion.is_anonymous ? 'Anonymous User' : (discussion.display_name || 'User')
    },
    datePublished: discussion.created_at,
    dateModified: discussion.updated_at,
    commentCount: replies.length,
    comment: replies.map(reply => ({
      '@type': 'Comment',
      text: reply.body,
      author: {
        '@type': 'Person',
        name: reply.is_anonymous ? 'Anonymous User' : (reply.display_name || 'User')
      },
      datePublished: reply.created_at
    })),
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: discussion.upvotes || 0
    }
  }
}

