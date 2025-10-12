'use client'

import Link from 'next/link'
import { Star, MapPin, Building2, Users, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getNeighborhoodImage, getBuildingImage } from '@/lib/defaultImages'

interface RatingCardProps {
  rating: any
  type: 'neighborhood' | 'building'
}

export default function RatingCard({ rating, type }: RatingCardProps) {
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

  return (
    <Link href={linkHref}>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden card-hover group">
        {/* Image Section */}
        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
          {/* Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Actual Image */}
              <img 
                src={displayImage}
                alt={type === 'neighborhood' 
                  ? `${rating.name} neighborhood in ${rating.city}, ${rating.province} - Rated ${rating.average_rating?.toFixed(1)}/5 stars with ${rating.total_ratings || 0} reviews` 
                  : `${rating.name} apartment building at ${rating.city}, ${rating.province} - Rated ${rating.average_rating?.toFixed(1)}/5 stars`
                } 
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true)
              setImageLoaded(true)
              // Try default image if user image fails
              if (userImage && !imageError) {
                e.currentTarget.src = defaultImage
              }
            }}
          />
          
              {/* Photo Badge */}
              {imageLoaded && (
                <>
                  {rating.cover_image && (
                    <div className="absolute top-3 right-3 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                      <Shield className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                  {!rating.cover_image && firstReviewImage && !imageError && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>User Photo</span>
                    </div>
                  )}
                </>
              )}
          
          {/* Total Reviews Badge (if available) */}
          {rating.total_ratings && rating.total_ratings > 0 && imageLoaded && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{rating.total_ratings} {rating.total_ratings === 1 ? 'Review' : 'Reviews'}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {rating.name}
            </h3>
            <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
              <span className="font-bold text-primary-600">
                {rating.average_rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
          
          {type === 'building' && rating.address && (
            <p className="text-gray-600 text-sm mb-1">{rating.address}</p>
          )}
          
          <p className="text-gray-600 flex items-center space-x-1 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{rating.city}, {rating.province}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

