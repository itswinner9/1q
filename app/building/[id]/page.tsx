'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Building2, Users, Sparkles, Wrench, DollarSign, Volume2, Package, Calendar, ArrowLeft, ChevronLeft, ChevronRight, MapPin, Camera, User, MessageCircle, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Building, BuildingReview } from '@/lib/supabase'
import ReviewVoting from '@/components/ReviewVoting'

export const dynamic = 'force-dynamic'

export default function BuildingDetail() {
  const params = useParams()
  const router = useRouter()
  const [building, setBuilding] = useState<Building | null>(null)
  const [reviews, setReviews] = useState<BuildingReview[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchBuilding(params.id as string)
    }
  }, [params.id])

  const fetchBuilding = async (idOrSlug: string) => {
    try {
      console.log('Fetching building:', idOrSlug)
      
      // Try to fetch by slug first (SEO-friendly), fallback to ID
      let query = supabase.from('buildings').select('*')
      
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
        console.error('Error fetching building:', error)
        setBuilding(null)
        setLoading(false)
        return
      }

      console.log('Building found:', data.name)
      setBuilding(data)

      // Fetch reviews using the actual building ID
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('building_reviews')
        .select('*')
        .eq('building_id', data.id)
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
      console.error('Error in fetchBuilding:', err)
      setBuilding(null)
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

  if (!building) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Building Not Found</h2>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn&apos;t find this building. It may have been removed or the link is incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                Go Home
              </Link>
              <Link href="/explore" className="btn-secondary">
                Explore Buildings
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/explore"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Explore</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Cover Image / Image Gallery */}
          <div className="relative h-[400px] lg:h-[500px] bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden">
            {/* Cover Image or User Photos */}
            {(building.cover_image || allImages.length > 0) ? (
              <>
                <img
                  src={building.cover_image || allImages[currentImageIndex]}
                  alt={`${building.name} in ${building.city}`}
                  className="w-full h-full object-cover"
                  onClick={() => {
                    if (allImages.length > 0) {
                      setShowImageGallery(true)
                      setSelectedImageIndex(currentImageIndex)
                    }
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                
                
                {/* Photo Count */}
                {allImages.length > 0 && (
                  <button
                    onClick={() => {
                      setShowImageGallery(true)
                      setSelectedImageIndex(0)
                    }}
                    className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-black/90 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="font-semibold text-sm">{allImages.length} Photo{allImages.length !== 1 ? 's' : ''}</span>
                  </button>
                )}
                
                {/* Navigation for multiple images */}
                {allImages.length > 1 && !building.cover_image && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-xl hover:bg-white transition-all"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-xl hover:bg-white transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-white w-8'
                              : 'bg-white/60 hover:bg-white/80 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              // Default gradient background if no images
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Building2 className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-2xl font-bold opacity-75">{building.name}</p>
                  <p className="text-lg opacity-60">{building.address}</p>
                </div>
              </div>
            )}
            
            {/* Location Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <div className="flex items-end justify-between">
                <div className="text-white">
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 drop-shadow-lg">
                    {building.name}
                  </h1>
                  <div className="flex items-center space-x-2 text-white/90 text-base lg:text-lg drop-shadow-md mb-1">
                    <Building2 className="w-5 h-5" />
                    <span>{building.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90 text-sm lg:text-base drop-shadow-md">
                    <MapPin className="w-4 h-4" />
                    <span>{building.city}, {building.province}, Canada</span>
                  </div>
                </div>
                
                {/* Rating Badge */}
                {building.average_rating > 0 && (
                  <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        <span className="text-4xl font-bold text-gray-900">
                          {building.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {building.total_reviews} Review{building.total_reviews !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8 xl:p-12">
            {/* Compact Stats Bar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {building.average_rating > 0 ? building.average_rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">{building.total_reviews || 0} reviews</div>
              </div>
              
              <div className="h-10 w-px bg-gray-200"></div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 mb-1">{allImages.length}</div>
                <div className="text-xs text-gray-600">Photos</div>
              </div>
              
              <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
              
              <div className="text-center hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {reviews.length > 0 ? new Date(Math.max(...reviews.map(r => new Date(r.created_at).getTime()))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
                <div className="text-xs text-gray-600">Latest</div>
              </div>
            </div>

            {/* Prominent CTA Card - At the top */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white text-center sm:text-left">
                  <h3 className="text-xl font-bold mb-1">Have experience with this building?</h3>
                  <p className="text-orange-100 text-sm">Share your rating and help others make informed decisions</p>
                </div>
                <Link
                  href={`/rate/building?prefill=${encodeURIComponent(JSON.stringify({
                    name: building.name,
                    address: building.address,
                    city: building.city,
                    province: building.province,
                    latitude: building.latitude,
                    longitude: building.longitude
                  }))}`}
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all font-bold shadow-md flex items-center space-x-2 whitespace-nowrap"
                >
                  <Star className="w-5 h-5" />
                  <span>Rate</span>
                </Link>
              </div>
            </div>

            {/* Category Ratings - Show if reviews exist */}
            {reviews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Category Breakdown</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {building.name} Management, Cleanliness, Maintenance & More
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'management', label: 'Management', icon: Users, avg: reviews.reduce((sum, r) => sum + r.management, 0) / reviews.length, color: 'text-blue-600' },
                    { id: 'cleanliness', label: 'Cleanliness', icon: Sparkles, avg: reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length, color: 'text-green-600' },
                    { id: 'maintenance', label: 'Maintenance', icon: Wrench, avg: reviews.reduce((sum, r) => sum + r.maintenance, 0) / reviews.length, color: 'text-orange-600' },
                    { id: 'rent_value', label: 'Rent Value', icon: DollarSign, avg: reviews.reduce((sum, r) => sum + r.rent_value, 0) / reviews.length, color: 'text-emerald-600' },
                    { id: 'noise', label: 'Noise Level', icon: Volume2, avg: reviews.reduce((sum, r) => sum + r.noise, 0) / reviews.length, color: 'text-purple-600' },
                    { id: 'amenities', label: 'Amenities', icon: Package, avg: reviews.reduce((sum, r) => sum + r.amenities, 0) / reviews.length, color: 'text-pink-600' },
                  ].map((category) => {
                    const Icon = category.icon
                    const percentage = (category.avg / 5) * 100
                    return (
                      <div key={category.id} className="group bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-orange-300 transition-all">
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br mb-2 ${
                            category.color === 'text-blue-600' ? 'from-blue-400 to-blue-500' :
                            category.color === 'text-green-600' ? 'from-green-400 to-green-500' :
                            category.color === 'text-orange-600' ? 'from-orange-400 to-orange-500' :
                            category.color === 'text-emerald-600' ? 'from-emerald-400 to-emerald-500' :
                            category.color === 'text-purple-600' ? 'from-purple-400 to-purple-500' :
                            'from-pink-400 to-pink-500'
                          }`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900 text-xs mb-1">{category.label}</span>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {category.avg.toFixed(1)}
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentage >= 80 ? 'bg-green-500' :
                                percentage >= 60 ? 'bg-blue-500' :
                                percentage >= 40 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            percentage >= 80 ? 'text-green-600' :
                            percentage >= 60 ? 'text-blue-600' :
                            percentage >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {percentage >= 80 && 'Excellent'}
                            {percentage >= 60 && percentage < 80 && 'Good'}
                            {percentage >= 40 && percentage < 60 && 'Average'}
                            {percentage < 40 && 'Poor'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Images Gallery */}
            {allImages.length > 1 && (
              <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Resident Photos</h2>
                    <p className="text-sm text-gray-600">{allImages.length} photos from residents</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImageIndex(0)
                      setShowImageGallery(true)
                    }}
                    className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition-all font-medium text-sm shadow-md"
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
                        alt={`${building.name} building photo ${idx + 1} - Real resident image from ${building.city}`}
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
                    className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + {allImages.length - 12} more photos
                  </button>
                )}
              </div>
            )}

            {/* All User Reviews */}
            {reviews.length > 0 && (
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Reviews ({reviews.length})</h2>
                    <p className="text-sm text-gray-600">Sorted by most helpful • Real residents</p>
                  </div>
                  
                  {/* Rating Filter */}
                  <select
                    value={ratingFilter || ''}
                    onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm font-medium bg-white shadow-sm"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">⭐ 5 Stars</option>
                    <option value="4">⭐ 4 Stars</option>
                    <option value="3">⭐ 3 Stars</option>
                    <option value="2">⭐ 2 Stars</option>
                    <option value="1">⭐ 1 Star</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {reviews
                    .filter(review => {
                      if (!ratingFilter) return true
                      const reviewAvg = Math.round((review.management + review.cleanliness + review.maintenance + review.rent_value + review.noise + review.amenities) / 6)
                      return reviewAvg === ratingFilter
                    })
                    .sort((a, b) => {
                      // Reddit-style algorithm: Sort by (upvotes - downvotes), then by date
                      const aScore = (a.helpful_count || 0) - (a.not_helpful_count || 0)
                      const bScore = (b.helpful_count || 0) - (b.not_helpful_count || 0)
                      if (aScore !== bScore) return bScore - aScore
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    })
                    .map((review, index) => {
                    const reviewAvg = (review.management + review.cleanliness + review.maintenance + review.rent_value + review.noise + review.amenities) / 6
                    const displayName = review.is_anonymous ? 'Anonymous User' : (review.display_name || 'Anonymous User')
                    
                    return (
                      <div key={review.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 bg-gradient-to-br ${review.is_anonymous ? 'from-gray-400 to-gray-500' : 'from-orange-500 to-orange-600'} rounded-lg flex items-center justify-center`}>
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 rounded-lg shadow-sm">
                            <Star className="w-4 h-4 text-white fill-white" />
                            <span className="font-bold text-white">{reviewAvg.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Individual Category Ratings */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                          <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2">
                            <Users className="w-4 h-4 text-blue-600 mb-1" />
                            <span className="text-xs text-gray-600">Management</span>
                            <span className="font-bold text-sm text-gray-900">{review.management}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-green-50 rounded-lg p-2">
                            <Sparkles className="w-4 h-4 text-green-600 mb-1" />
                            <span className="text-xs text-gray-600">Clean</span>
                            <span className="font-bold text-sm text-gray-900">{review.cleanliness}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-orange-50 rounded-lg p-2">
                            <Wrench className="w-4 h-4 text-orange-600 mb-1" />
                            <span className="text-xs text-gray-600">Maintenance</span>
                            <span className="font-bold text-sm text-gray-900">{review.maintenance}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-emerald-50 rounded-lg p-2">
                            <DollarSign className="w-4 h-4 text-emerald-600 mb-1" />
                            <span className="text-xs text-gray-600">Rent Value</span>
                            <span className="font-bold text-sm text-gray-900">{review.rent_value}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-purple-50 rounded-lg p-2">
                            <Volume2 className="w-4 h-4 text-purple-600 mb-1" />
                            <span className="text-xs text-gray-600">Noise</span>
                            <span className="font-bold text-sm text-gray-900">{review.noise}/5</span>
                          </div>
                          <div className="flex flex-col items-center bg-pink-50 rounded-lg p-2">
                            <Package className="w-4 h-4 text-pink-600 mb-1" />
                            <span className="text-xs text-gray-600">Amenities</span>
                            <span className="font-bold text-sm text-gray-900">{review.amenities}/5</span>
                          </div>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <div className="bg-gray-50 rounded-lg p-4 mt-3 border border-gray-200">
                            <div className="flex items-start space-x-2">
                              <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        )}

                        {/* Like/Dislike Voting */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <ReviewVoting
                            reviewId={review.id}
                            reviewType="building"
                            helpfulCount={review.helpful_count || 0}
                            notHelpfulCount={review.not_helpful_count || 0}
                          />
                        </div>

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
                                  alt={`${building.name} review photo ${imgIndex + 1} from ${displayName}`}
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
