'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, MapPin, Shield, Sparkles, Volume2, Users, Train, Package, Calendar, ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, User, X, Camera } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Neighborhood, NeighborhoodReview } from '@/lib/supabase'
import { generateNeighborhoodStructuredData } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default function NeighborhoodDetail() {
  const params = useParams()
  const router = useRouter()
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null)
  const [reviews, setReviews] = useState<NeighborhoodReview[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchNeighborhood(params.id as string)
    }
  }, [params.id])

  const fetchNeighborhood = async (idOrSlug: string) => {
    try {
      console.log('Fetching neighborhood:', idOrSlug)
      
      // Try to fetch by slug first (SEO-friendly), fallback to ID
      let query = supabase.from('neighborhoods').select('*')
      
      // Check if it's a UUID or a slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
      
      if (isUUID) {
        console.log('Searching by UUID')
        query = query.eq('id', idOrSlug)
      } else {
        console.log('Searching by slug')
        query = query.eq('slug', idOrSlug)
      }
      
      const { data, error } = await query.single()

      if (error || !data) {
        console.error('Error fetching neighborhood:', error)
        setNeighborhood(null)
        setLoading(false)
        return
      }

      console.log('Neighborhood found:', data.name)
      setNeighborhood(data)

      // Fetch reviews using the actual neighborhood ID
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('neighborhood_reviews')
        .select('*')
        .eq('neighborhood_id', data.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      }

      if (reviewsData && reviewsData.length > 0) {
        console.log('Found reviews:', reviewsData.length)
        setReviews(reviewsData)
        
        const images: string[] = []
        reviewsData.forEach(review => {
          if (review.images && review.images.length > 0) {
            images.push(...review.images)
          }
        })
        setAllImages(images)
      } else if (data.images && data.images.length > 0) {
        // Fallback to old structure
        setAllImages(data.images)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error in fetchNeighborhood:', err)
      setNeighborhood(null)
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }
  }

  const prevImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? allImages.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div>
      </div>
    )
  }

  if (!neighborhood) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Neighborhood not found</p>
          <Link href="/explore" className="text-primary-500 hover:text-primary-600 mt-4 inline-block">
            Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      {/* JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(generateNeighborhoodStructuredData(neighborhood, reviews))
        }}
      />
      
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/explore"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Explore</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Image Gallery */}
          {allImages.length > 0 && (
            <div className="relative h-[500px] bg-gradient-to-br from-primary-100 to-primary-200">
              <img
                src={allImages[currentImageIndex]}
                alt={`${neighborhood.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Header Section - Improved */}
            <div className="mb-10">
              {/* Location Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-full mb-4">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">
                  {neighborhood.city}, {neighborhood.province}, Canada
                </span>
              </div>
              
              {/* Main Title */}
              <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {neighborhood.name}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                Neighborhood Reviews & Ratings
              </p>

              {/* Rating Summary Bar */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Overall Rating */}
                  <div className="text-center md:text-left">
                    <div className="text-6xl font-bold mb-2">
                      {reviews.length > 0 
                        ? (reviews.reduce((sum, r) => sum + ((r.safety + r.cleanliness + r.noise + r.community + r.transit + r.amenities) / 6), 0) / reviews.length).toFixed(1)
                        : neighborhood.average_rating.toFixed(1)
                      }
                    </div>
                    <div className="flex items-center justify-center md:justify-start space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.round(reviews.length > 0 
                              ? reviews.reduce((sum, r) => sum + ((r.safety + r.cleanliness + r.noise + r.community + r.transit + r.amenities) / 6), 0) / reviews.length
                              : neighborhood.average_rating)
                              ? 'text-white fill-white'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-primary-100 font-medium">Overall Rating</div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold mb-1">{reviews.length}</div>
                      <div className="text-primary-100 text-sm">Total Reviews</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold mb-1">{allImages.length}</div>
                      <div className="text-primary-100 text-sm">User Photos</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span className="text-lg font-semibold">Latest</span>
                      </div>
                      <div className="text-primary-100 text-sm mt-1">
                        {new Date(neighborhood.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span className="text-lg font-semibold">Verified</span>
                      </div>
                      <div className="text-primary-100 text-sm mt-1">All Reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Ratings - Show if reviews exist */}
            {reviews.length > 0 && (
              <div className="mb-12">
                {/* SEO-optimized H2 with categories */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Category Breakdown
                </h2>
                <p className="text-gray-600 mb-8">
                  {neighborhood.name} Safety, Cleanliness, Noise, Transit & Community Ratings
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 'safety', label: 'Safety', icon: Shield, avg: reviews.reduce((sum, r) => sum + r.safety, 0) / reviews.length, color: 'text-green-600' },
                    { id: 'cleanliness', label: 'Cleanliness', icon: Sparkles, avg: reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length, color: 'text-blue-600' },
                    { id: 'noise', label: 'Noise Level', icon: Volume2, avg: reviews.reduce((sum, r) => sum + r.noise, 0) / reviews.length, color: 'text-purple-600' },
                    { id: 'community', label: 'Community', icon: Users, avg: reviews.reduce((sum, r) => sum + r.community, 0) / reviews.length, color: 'text-pink-600' },
                    { id: 'transit', label: 'Transit Access', icon: Train, avg: reviews.reduce((sum, r) => sum + r.transit, 0) / reviews.length, color: 'text-indigo-600' },
                    { id: 'amenities', label: 'Amenities', icon: Package, avg: reviews.reduce((sum, r) => sum + r.amenities, 0) / reviews.length, color: 'text-orange-600' },
                  ].map((category) => {
                    const Icon = category.icon
                    const percentage = (category.avg / 5) * 100
                    return (
                      <div key={category.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                            category.color === 'text-green-600' ? 'from-green-50 to-green-100' :
                            category.color === 'text-blue-600' ? 'from-blue-50 to-blue-100' :
                            category.color === 'text-purple-600' ? 'from-purple-50 to-purple-100' :
                            category.color === 'text-pink-600' ? 'from-pink-50 to-pink-100' :
                            category.color === 'text-indigo-600' ? 'from-indigo-50 to-indigo-100' :
                            'from-orange-50 to-orange-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${category.color}`} />
                          </div>
                          <span className="font-bold text-gray-900 text-lg">{category.label}</span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-4xl font-bold text-gray-900">
                              {category.avg.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-sm">/ 5.0</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                percentage >= 80 ? 'bg-green-500' :
                                percentage >= 60 ? 'bg-primary-500' :
                                percentage >= 40 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Rating Label */}
                        <div className="text-sm font-medium">
                          {percentage >= 80 && <span className="text-green-600">Excellent</span>}
                          {percentage >= 60 && percentage < 80 && <span className="text-primary-600">Good</span>}
                          {percentage >= 40 && percentage < 60 && <span className="text-yellow-600">Average</span>}
                          {percentage < 40 && <span className="text-red-600">Needs Improvement</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Images Gallery */}
            {allImages.length > 0 && (
              <div className="mb-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Community Photos
                    </h2>
                    <p className="text-gray-600">{allImages.length} real {allImages.length === 1 ? 'photo' : 'photos'} from residents</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImageIndex(0)
                      setShowImageGallery(true)
                    }}
                    className="bg-primary-500 text-white px-5 py-2 rounded-lg hover:bg-primary-600 transition-all font-medium text-sm shadow-md"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {allImages.slice(0, 12).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedImageIndex(idx)
                        setShowImageGallery(true)
                      }}
                      className="relative h-36 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform group shadow-md"
                    >
                      <img
                        src={img}
                        alt={`${neighborhood.name} neighborhood photo ${idx + 1} - Real resident image from ${neighborhood.city}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          View
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {allImages.length > 12 && (
                  <button
                    onClick={() => {
                      setSelectedImageIndex(0)
                      setShowImageGallery(true)
                    }}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + {allImages.length - 12} more photos
                  </button>
                )}
              </div>
            )}

            {/* All User Reviews */}
            {reviews.length > 0 && (
              <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageCircle className="w-7 h-7 text-primary-500" />
                      <h2 className="text-3xl font-bold text-gray-900">
                        Resident Reviews
                      </h2>
                    </div>
                    <p className="text-gray-600">
                      {ratingFilter ? reviews.filter(r => Math.round((r.safety + r.cleanliness + r.noise + r.community + r.transit + r.amenities) / 6) === ratingFilter).length : reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'} from real residents
                    </p>
                  </div>
                  
                  {/* Rating Filter */}
                  <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    <select
                      value={ratingFilter || ''}
                      onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium bg-white"
                    >
                      <option value="">All Ratings</option>
                      <option value="5">⭐ 5 Stars Only</option>
                      <option value="4">⭐ 4 Stars Only</option>
                      <option value="3">⭐ 3 Stars Only</option>
                      <option value="2">⭐ 2 Stars Only</option>
                      <option value="1">⭐ 1 Star Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews
                    .filter(review => {
                      if (!ratingFilter) return true
                      const reviewAvg = Math.round((review.safety + review.cleanliness + review.noise + review.community + review.transit + review.amenities) / 6)
                      return reviewAvg === ratingFilter
                    })
                    .map((review, index) => {
                    const reviewAvg = (review.safety + review.cleanliness + review.noise + review.community + review.transit + review.amenities) / 6
                    const displayName = review.is_anonymous ? 'Anonymous User' : (review.display_name || 'Anonymous User')
                    
                    return (
                      <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${review.is_anonymous ? 'from-gray-400 to-gray-500' : 'from-primary-500 to-primary-600'} rounded-lg flex items-center justify-center shadow-md`}>
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{displayName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
                            <span className="font-bold text-primary-600">{reviewAvg.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Individual Category Ratings */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                          <div className="flex flex-col items-center bg-green-50 rounded-lg p-2">
                            <Shield className="w-4 h-4 text-green-600 mb-1" />
                            <span className="text-xs text-gray-600">Safety</span>
                            <span className="font-bold text-sm text-gray-900">{review.safety}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2">
                            <Sparkles className="w-4 h-4 text-blue-600 mb-1" />
                            <span className="text-xs text-gray-600">Clean</span>
                            <span className="font-bold text-sm text-gray-900">{review.cleanliness}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-purple-50 rounded-lg p-2">
                            <Volume2 className="w-4 h-4 text-purple-600 mb-1" />
                            <span className="text-xs text-gray-600">Noise</span>
                            <span className="font-bold text-sm text-gray-900">{review.noise}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-pink-50 rounded-lg p-2">
                            <Users className="w-4 h-4 text-pink-600 mb-1" />
                            <span className="text-xs text-gray-600">Community</span>
                            <span className="font-bold text-sm text-gray-900">{review.community}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-indigo-50 rounded-lg p-2">
                            <Train className="w-4 h-4 text-indigo-600 mb-1" />
                            <span className="text-xs text-gray-600">Transit</span>
                            <span className="font-bold text-sm text-gray-900">{review.transit}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-orange-50 rounded-lg p-2">
                            <Package className="w-4 h-4 text-orange-600 mb-1" />
                            <span className="text-xs text-gray-600">Amenities</span>
                            <span className="font-bold text-sm text-gray-900">{review.amenities}/5</span>
                          </div>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
                            <div className="flex items-start space-x-2">
                              <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        )}

                        {/* Review Photos */}
                        {review.images && review.images.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Camera className="w-4 h-4 text-gray-500" />
                              <span className="text-xs text-gray-600 font-medium">{review.images.length} {review.images.length === 1 ? 'Photo' : 'Photos'}</span>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                              {review.images.map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={img}
                                  alt={`${neighborhood.name} review photo ${imgIndex + 1} from ${displayName}`}
                                  className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity shadow-sm"
                                  onClick={() => {
                                    const imageIndexInAll = allImages.indexOf(img)
                                    if (imageIndexInAll !== -1) {
                                      setSelectedImageIndex(imageIndexInAll)
                                      setShowImageGallery(true)
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="p-8 bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Have experience with this neighborhood?
              </h3>
              <p className="text-gray-600 mb-6">
                Share your own rating and help others make informed decisions
              </p>
              <Link 
                href={`/rate/neighborhood?prefill=${encodeURIComponent(JSON.stringify({
                  name: neighborhood.name,
                  city: neighborhood.city,
                  province: neighborhood.province,
                  latitude: neighborhood.latitude,
                  longitude: neighborhood.longitude
                }))}`}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Rate This Neighborhood</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Image Gallery Modal */}
        {showImageGallery && allImages.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            <button
              onClick={() => setShowImageGallery(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={() => setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
              className="absolute left-4 text-white hover:text-gray-300 p-2"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>

            <div className="max-w-6xl max-h-screen p-4">
              <img
                src={allImages[selectedImageIndex]}
                alt={`Photo ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
              <div className="text-center mt-4 text-white">
                <p className="text-sm">{selectedImageIndex + 1} / {allImages.length}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedImageIndex(prev => (prev + 1) % allImages.length)}
              className="absolute right-4 text-white hover:text-gray-300 p-2"
            >
              <ChevronRight className="w-12 h-12" />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
