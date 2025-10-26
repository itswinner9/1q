'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, MapPin, Phone, Mail, Globe, User, MessageSquare, Wrench, Scale, Briefcase, ArrowLeft, Camera, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Landlord {
  id: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  city: string
  province: string
  country: string
  description: string | null
  overall_rating: number
  responsiveness_rating: number
  maintenance_rating: number
  communication_rating: number
  fairness_rating: number
  professionalism_rating: number
  total_reviews: number
  profile_image?: string
  created_at: string
}

interface Review {
  id: string
  review: string
  comment?: string
  pros: string | null
  cons: string | null
  overall_rating: number
  responsiveness?: number
  responsiveness_rating?: number | null
  maintenance?: number
  maintenance_rating?: number | null
  communication?: number
  communication_rating?: number | null
  fairness?: number
  fairness_rating?: number | null
  professionalism?: number
  professionalism_rating?: number | null
  years_rented: number | null
  monthly_rent: number | null
  would_recommend: boolean | null
  is_anonymous: boolean
  display_name: string | null
  created_at: string
  status: string
  images?: string[] | null
}

export default function LandlordPage() {
  const params = useParams()
  const router = useRouter()
  const [landlord, setLandlord] = useState<Landlord | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [recommendFilter, setRecommendFilter] = useState<'all' | 'recommend' | 'not-recommend'>('all')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchLandlord()
      checkCurrentUser()
    }
  }, [params.id])

  // Recheck hasReviewed when currentUser or reviews change
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const userReview = reviews.find((review: any) => review.user_id === currentUser.id)
      setHasReviewed(!!userReview)
    }
  }, [currentUser, reviews])

  const checkCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setCurrentUser(session.user)
    }
  }

  const fetchLandlord = async () => {
    try {
      const { data: landlordData, error: landlordError } = await supabase
        .from('landlords')
        .select('*')
        .eq('id', params.id)
        .single()

      if (landlordError) {
        console.error('Error fetching landlord:', landlordError)
        return
      }

      setLandlord(landlordData)

      // Fetch approved reviews only
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('landlord_reviews')
        .select('*')
        .eq('landlord_id', params.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      } else {
        console.log('📸 Fetched reviews:', reviewsData)
        if (reviewsData) {
          reviewsData.forEach((review: any) => {
            console.log(`Review ${review.id} images:`, review.images)
          })
        }
        setReviews(reviewsData || [])
        
        // Check if current user has reviewed this landlord
        if (currentUser && reviewsData) {
          const userReview = reviewsData.find((review: any) => review.user_id === currentUser.id)
          setHasReviewed(!!userReview)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'from-green-500 to-emerald-600'
    if (rating >= 3.5) return 'from-blue-500 to-cyan-600'
    if (rating >= 2.5) return 'from-yellow-500 to-orange-500'
    if (rating >= 1.5) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-rose-700'
  }

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 3.5) return 'Good'
    if (rating >= 2.5) return 'Average'
    if (rating >= 1.5) return 'Poor'
    return 'Very Poor'
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !landlord) return

    // Check if user is logged in
    if (!currentUser) {
      alert('❌ Please log in to upload a profile image')
      return
    }

    // Check if user has reviewed this landlord
    if (!hasReviewed) {
      alert('❌ Only users who have reviewed this landlord can upload profile images.\n\nPlease submit a review first!')
      return
    }

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${landlord.id}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Upload to landlord-images bucket
      const { error: uploadError } = await supabase.storage
        .from('landlord-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload image')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('landlord-images')
        .getPublicUrl(filePath)

      // Update landlord record
      const { error: updateError } = await supabase
        .from('landlords')
        .update({ profile_image: publicUrl })
        .eq('id', landlord.id)

      if (updateError) {
        console.error('Update error:', updateError)
        alert('Failed to update profile image')
        return
      }

      // Update local state
      setLandlord({ ...landlord, profile_image: publicUrl })
      alert('✅ Profile image updated!')
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading landlord profile...</p>
        </div>
      </div>
    )
  }

  if (!landlord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Landlord Not Found</h2>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn&apos;t find this landlord. They may have been removed or the link is incorrect.
            </p>
            <Link
              href="/explore"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const ratingColor = getRatingColor(landlord.overall_rating)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Modern Compact Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/explore"
                className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">{landlord.name}</h1>
                {landlord.company_name && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{landlord.company_name}</p>
                )}
              </div>
            </div>
            {/* Quick Rating Badge */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-primary-100 px-3 sm:px-4 py-2 rounded-full border border-primary-200">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <span className="text-base sm:text-lg font-bold text-gray-900">{(landlord.overall_rating || 0).toFixed(1)}</span>
              <span className="text-xs text-gray-600 hidden sm:inline">({landlord.total_reviews || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT SIDE - Profile Information (Sticky) */}
          <div className="w-full lg:w-[400px] lg:flex-shrink-0 lg:border-r lg:border-gray-200 lg:pr-8">
            <div className="lg:sticky lg:top-24">
            <div className="bg-white space-y-6">
              {/* Profile Image/Initial */}
              <div className="relative">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 group">
                  {landlord.profile_image ? (
                    <img 
                      src={landlord.profile_image} 
                      alt={landlord.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, hide the img element and show the fallback
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-7xl font-bold text-white opacity-90">{landlord.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {/* Fallback in case image fails to load */}
                  {landlord.profile_image && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100" style={{ display: 'none' }}>
                      <span className="text-7xl font-bold text-white opacity-90">{landlord.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {/* Upload Overlay - Only show if user has reviewed */}
                  {hasReviewed && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            {landlord.profile_image ? 'Change Photo' : 'Add Photo'}
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Badge */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{landlord.name}</h1>
                  {(landlord.overall_rating || 0) >= 4.5 && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">TOP RATED</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">{landlord.city}, {landlord.province}</p>
                
                {/* Rating Display */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-bold text-gray-900">{(landlord.overall_rating || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">{landlord.total_reviews || 0} reviews</span>
                </div>
              </div>

                            {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/rate/landlord?prefill=${encodeURIComponent(JSON.stringify({ landlord: landlord.name }))}`}
                  className="flex-1 bg-primary-600 text-white text-center px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Rate Landlord
                </Link>
                {(landlord.phone || landlord.email) && (
                  <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                    Contact
                  </button>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-4 border-b border-gray-200">
                <button className="pb-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900">Reviews ({landlord.total_reviews || 0})</button>
              </div>

              {/* Rating Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Rating Breakdown</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Responsiveness', rating: landlord.responsiveness_rating || 0, icon: MessageSquare, color: 'blue' },
                    { label: 'Maintenance', rating: landlord.maintenance_rating || 0, icon: Wrench, color: 'green' },
                    { label: 'Communication', rating: landlord.communication_rating || 0, icon: MessageSquare, color: 'purple' },
                    { label: 'Fairness', rating: landlord.fairness_rating || 0, icon: Scale, color: 'yellow' },
                    { label: 'Professionalism', rating: landlord.professionalism_rating || 0, icon: Briefcase, color: 'indigo' },
                  ].map((category) => {
                    const Icon = category.icon
                    const ratingValue = category.rating || 0
                    const percentage = (ratingValue / 5) * 100
                    return (
                      <div key={category.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                              category.color === 'blue' ? 'text-blue-600' :
                              category.color === 'green' ? 'text-green-600' :
                              category.color === 'purple' ? 'text-purple-600' :
                              category.color === 'yellow' ? 'text-yellow-600' :
                              'text-indigo-600'
                            }`} />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">{category.label}</span>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-gray-900">{ratingValue.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
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
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* RIGHT SIDE - Reviews */}
          <div className="w-full lg:flex-1 lg:min-w-0">
            {/* Filters */}
            {reviews.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-3">
                
                  {/* Rating Filter */}
                    <select
                      value={ratingFilter || ''}
                      onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                      className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-medium bg-white shadow-sm hover:border-primary-300 transition-colors"
                    >
                      <option value="">⭐ All Ratings</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                      <option value="3">⭐⭐⭐ 3 Stars</option>
                      <option value="2">⭐⭐ 2 Stars</option>
                      <option value="1">⭐ 1 Star</option>
                    </select>

                    {/* Recommendation Filter */}
                    <select
                      value={recommendFilter}
                      onChange={(e) => setRecommendFilter(e.target.value as 'all' | 'recommend' | 'not-recommend')}
                      className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-medium bg-white shadow-sm hover:border-primary-300 transition-colors"
                    >
                      <option value="all">✅ All Reviews</option>
                      <option value="recommend">👍 Would Recommend</option>
                      <option value="not-recommend">👎 Would Not Recommend</option>
                    </select>

                    {/* Sort By */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
                      className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-medium bg-white shadow-sm hover:border-primary-300 transition-colors"
                    >
                      <option value="newest">🕐 Newest First</option>
                      <option value="oldest">🕐 Oldest First</option>
                      <option value="highest">⭐ Highest Rated</option>
                      <option value="lowest">⭐ Lowest Rated</option>
                    </select>
                </div>
              </div>
            )}
            
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No reviews yet</p>
                  <p className="text-gray-400 text-sm mb-6">Be the first to review this landlord</p>
                  <Link
                    href={`/rate/landlord?landlord=${landlord.id}`}
                    className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Write a Review
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {reviews
                    .filter(review => {
                      // Rating filter
                      if (ratingFilter) {
                        const reviewAvg = Math.round(review.overall_rating)
                        if (reviewAvg !== ratingFilter) return false
                      }
                      
                      // Recommendation filter
                      if (recommendFilter === 'recommend' && !review.would_recommend) return false
                      if (recommendFilter === 'not-recommend' && review.would_recommend) return false
                      
                      return true
                    })
                    .sort((a, b) => {
                      switch (sortBy) {
                        case 'oldest':
                          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        case 'highest':
                          return b.overall_rating - a.overall_rating
                        case 'lowest':
                          return a.overall_rating - b.overall_rating
                        case 'newest':
                        default:
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      }
                    })
                    .map((review) => {
                      const displayName = review.is_anonymous ? 'Anonymous User' : (review.display_name || 'Anonymous User')
                      const reviewText = review.comment || review.review || 'No review text provided'
                      
                      return (
                        <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRatingColor(review.overall_rating)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-base text-gray-900 truncate">{displayName}</p>
                                <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                              </div>
                            </div>
                            <div className={`bg-gradient-to-r ${getRatingColor(review.overall_rating)} px-3 py-1.5 rounded-lg flex items-center space-x-1.5 flex-shrink-0`}>
                              <Star className="w-4 h-4 text-white fill-white" />
                              <span className="font-bold text-sm text-white">{review.overall_rating.toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Review Text */}
                          <p className="text-gray-700 mb-4 text-base leading-relaxed line-clamp-4">{reviewText}</p>

                          {/* Review Images */}
                          {review.images && (
                            <div className="mb-4">
                              {(() => {
                                // Handle both array and string cases
                                let imageUrls: string[] = []
                                if (Array.isArray(review.images)) {
                                  imageUrls = review.images
                                } else if (typeof review.images === 'string') {
                                  try {
                                    const parsed = JSON.parse(review.images)
                                    imageUrls = Array.isArray(parsed) ? parsed : [review.images]
                                  } catch {
                                    imageUrls = [review.images]
                                  }
                                }
                                
                                if (imageUrls.length === 0) return null
                                
                                return (
                                  <div className="grid grid-cols-3 gap-2">
                                    {imageUrls.slice(0, 6).map((imageUrl, idx) => (
                                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                          src={imageUrl}
                                          alt={`Review image ${idx + 1}`}
                                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                          onError={(e) => {
                                            console.error('❌ Failed to load image:', imageUrl)
                                            e.currentTarget.style.display = 'none'
                                          }}
                                          onLoad={() => {
                                            console.log('✅ Loaded image:', imageUrl)
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )
                              })()}
                            </div>
                          )}

                          {/* Category Ratings */}
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            {(review.responsiveness || review.responsiveness_rating) && (
                              <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-600 mb-1" />
                                <span className="text-[10px] text-gray-600 text-center leading-tight font-medium">Res</span>
                                <span className="font-bold text-xs text-gray-900">{(review.responsiveness || review.responsiveness_rating)}</span>
                              </div>
                            )}
                            {(review.maintenance || review.maintenance_rating) && (
                              <div className="flex flex-col items-center bg-green-50 rounded-lg p-2">
                                <Wrench className="w-3.5 h-3.5 text-green-600 mb-1" />
                                <span className="text-[10px] text-gray-600 text-center leading-tight font-medium">Maint</span>
                                <span className="font-bold text-xs text-gray-900">{(review.maintenance || review.maintenance_rating)}</span>
                              </div>
                            )}
                            {(review.communication || review.communication_rating) && (
                              <div className="flex flex-col items-center bg-purple-50 rounded-lg p-2">
                                <MessageSquare className="w-3.5 h-3.5 text-purple-600 mb-1" />
                                <span className="text-[10px] text-gray-600 text-center leading-tight font-medium">Comm</span>
                                <span className="font-bold text-xs text-gray-900">{(review.communication || review.communication_rating)}</span>
                              </div>
                            )}
                            {(review.fairness || review.fairness_rating) && (
                              <div className="flex flex-col items-center bg-yellow-50 rounded-lg p-2">
                                <Scale className="w-3.5 h-3.5 text-yellow-600 mb-1" />
                                <span className="text-[10px] text-gray-600 text-center leading-tight font-medium">Fair</span>
                                <span className="font-bold text-xs text-gray-900">{(review.fairness || review.fairness_rating)}</span>
                              </div>
                            )}
                            {(review.professionalism || review.professionalism_rating) && (
                              <div className="flex flex-col items-center bg-indigo-50 rounded-lg p-2">
                                <Briefcase className="w-3.5 h-3.5 text-indigo-600 mb-1" />
                                <span className="text-[10px] text-gray-600 text-center leading-tight font-medium">Pro</span>
                                <span className="font-bold text-xs text-gray-900">{(review.professionalism || review.professionalism_rating)}</span>
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          <div className="flex flex-wrap gap-2 text-xs pt-4 border-t border-gray-200">
                            {review.years_rented && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Rented {review.years_rented}yr{review.years_rented !== 1 ? 's' : ''}</span>
                            )}
                            {review.monthly_rent && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${review.monthly_rent.toLocaleString()}/mo</span>
                            )}
                            {review.would_recommend !== null && (
                              <span className={`px-2 py-1 rounded-full flex items-center space-x-1 ${
                                review.would_recommend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {review.would_recommend ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                <span>{review.would_recommend ? 'Recommend' : 'Not recommend'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
