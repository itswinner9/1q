'use client'

import Link from 'next/link'
import { Star, MapPin, Building2, Users, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getNeighborhoodImage, getBuildingImage } from '@/lib/defaultImages'

interface RatingCardProps {
  rating: any
  type: 'neighborhood' | 'building'
  viewMode?: 'grid' | 'list'
}

export default function RatingCard({ rating, type, viewMode = 'grid' }: RatingCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [firstReviewImage, setFirstReviewImage] = useState<string | null>(null)
  
  // Get image from rating (simple structure)
  useEffect(() => {
    if (rating.images && Array.isArray(rating.images) && rating.images.length > 0) {
      setFirstReviewImage(rating.images[0])
    }
  }, [rating])
  
  // Get default image as fallback
  const defaultImage = type === 'neighborhood' 
    ? getNeighborhoodImage(rating.name) 
    : getBuildingImage(rating.name)
  
  // Priority: cover_image (admin set) > review image (user uploaded) > default
  const displayImage = rating.cover_image 
    ? rating.cover_image 
    : (firstReviewImage && !imageError) 
      ? firstReviewImage 
      : defaultImage
  
  const Icon = type === 'neighborhood' ? MapPin : Building2
  // Use slug for SEO-friendly URLs, fallback to ID
  const linkHref = type === 'neighborhood' 
    ? `/neighborhood/${rating.slug || rating.id}` 
    : `/building/${rating.slug || rating.id}`

  const hasRating = rating.average_rating && rating.average_rating > 0
  const reviewCount = rating.total_reviews || 0

  return (
    <Link href={linkHref}>
      <div className={`group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary-300 shadow-lg hover:shadow-2xl transition-all duration-300 ${
        viewMode === 'list' ? 'flex items-center space-x-6 p-6 hover:-translate-y-1' : 'hover:-translate-y-2'
      }`}>
        {/* Image Section */}
        <div className={`${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'h-56'} bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden rounded-xl`}>
          {/* Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Image */}
          <img 
            src={displayImage}
            alt={`${rating.name} in ${rating.city}`} 
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true)
              setImageLoaded(true)
              if (firstReviewImage && !imageError) {
                e.currentTarget.src = defaultImage
              }
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Rating Badge - Top Right */}
          {hasRating && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-xl text-gray-900">
                  {(rating.average_rating || 0).toFixed(1)}
                </span>
              </div>
            </div>
          )}
          
          {/* Review Count - Bottom Left */}
          {reviewCount > 0 && (
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="font-semibold text-sm">{reviewCount} Review{reviewCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {/* No Rating Badge */}
          {!hasRating && (
            <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-bold">
              Not Rated Yet
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className={`${viewMode === 'list' ? 'flex-1' : 'p-6'}`}>
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
              {rating.name}
            </h3>
            
            {type === 'building' && rating.address && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-1">{rating.address}</p>
            )}
            
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="line-clamp-1">{rating.city}, {rating.province}</span>
            </div>
          </div>

          {/* Rating Breakdown */}
          {hasRating ? (
            <div className={`${viewMode === 'list' ? 'pt-2' : 'pt-4 border-t border-gray-100'}`}>
              <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'justify-between'}`}>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(rating.average_rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {(rating.average_rating || 0).toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {reviewCount} rating{reviewCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className={`${viewMode === 'list' ? 'pt-2' : 'pt-4 border-t border-gray-100'}`}>
              <div className={`${viewMode === 'list' ? 'text-left' : 'text-center py-2'}`}>
                <p className="text-sm text-gray-500">Be the first to rate!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

