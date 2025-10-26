'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Star, Upload, X, MapPin, Shield, Sparkles, Volume2, Users, Train, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PhotonAutocomplete from '@/components/PhotonAutocomplete'

interface RatingCategory {
  id: string
  label: string
  icon: React.ReactNode
  value: number
}

function RateNeighborhoodForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isPreFilled, setIsPreFilled] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')

  const [ratings, setRatings] = useState<RatingCategory[]>([
    { id: 'safety', label: 'Safety', icon: <Shield className="w-5 h-5" />, value: 0 },
    { id: 'cleanliness', label: 'Cleanliness', icon: <Sparkles className="w-5 h-5" />, value: 0 },
    { id: 'noise', label: 'Noise Level', icon: <Volume2 className="w-5 h-5" />, value: 0 },
    { id: 'community', label: 'Community', icon: <Users className="w-5 h-5" />, value: 0 },
    { id: 'transit', label: 'Access to Transit', icon: <Train className="w-5 h-5" />, value: 0 },
    { id: 'amenities', label: 'Amenities', icon: <Package className="w-5 h-5" />, value: 0 },
  ])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          setUserLoading(false)
          router.push('/login?redirect=/rate/neighborhood')
          return
        }
        
        if (!session) {
          console.log('No session found, redirecting to login')
          setUserLoading(false)
          router.push('/login?redirect=/rate/neighborhood')
          return
        }
        
        console.log('User authenticated:', session.user.email)
        setUser(session.user)
        setUserLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUserLoading(false)
        router.push('/login?redirect=/rate/neighborhood')
      }
    }
    
    checkAuth()
    
    // Check for pre-fill data from URL
    const prefillData = searchParams?.get('prefill')
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData)
        setName(data.name || '')
        setCity(data.city || '')
        setProvince(data.province || '')
        setLatitude(data.latitude || 0)
        setLongitude(data.longitude || 0)
        setIsPreFilled(true)
      } catch (e) {
        console.error('Error parsing prefill data:', e)
      }
    }
  }, [router, searchParams])

  const handleRatingChange = (categoryId: string, value: number) => {
    setRatings(ratings.map(r => r.id === categoryId ? { ...r, value } : r))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    setImages([...images, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (loading) {
      console.log('Already submitting, please wait...')
      return
    }
    
    // Validate form
    if (!name || !city || !province) {
      alert('❌ Please fill in neighborhood name, city, and province')
      return
    }

    if (ratings.some(r => r.value === 0)) {
      alert('❌ Please rate all categories')
      return
    }
    
    // Double-check user is logged in by getting current session
    console.log('Checking authentication before submit...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      alert('❌ Authentication error. Please try logging in again.')
      router.push('/login?redirect=/rate/neighborhood')
      return
    }
    
    if (!session || !session.user) {
      console.log('No session found')
      alert('❌ You must be logged in to submit a rating. Redirecting to login...')
      router.push('/login?redirect=/rate/neighborhood')
      return
    }
    
    console.log('✅ User authenticated:', session.user.email)

    setLoading(true)

    try {
      // Use session user
      const currentUser = session.user
      console.log('Submitting rating for user:', currentUser.id)
      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `neighborhoods/${currentUser.id}/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const { data, error } = await supabase.storage
          .from('neighborhood-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Error uploading image:', error)
          continue // Skip this image and continue with others
        }

        if (data) {
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('neighborhood-images')
            .getPublicUrl(fileName)
          
          if (urlData?.publicUrl) {
            imageUrls.push(urlData.publicUrl)
          }
        }
      }
      
      console.log('Uploaded image URLs:', imageUrls)

      // STEP 1: Check if neighborhood location exists
      console.log('Checking if neighborhood exists:', name, city, province)
      
      const { data: existingNeighborhood, error: searchError } = await supabase
        .from('neighborhoods')
        .select('id')
        .ilike('name', name)
        .ilike('city', city)
        .ilike('province', province)
        .maybeSingle()

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Search error:', searchError)
        throw searchError
      }

      let neighborhoodId: string

      if (existingNeighborhood) {
        // Location exists - use it
        neighborhoodId = existingNeighborhood.id
        console.log('✅ Neighborhood location exists')
      } else {
        // Location doesn't exist - create it
        console.log('✅ Creating new neighborhood location...')
        
        // Generate SEO-friendly slug
        const slug = `${name}-${city}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        const { data: newNeighborhood, error: createError } = await supabase
          .from('neighborhoods')
          .insert({
            name,
            city,
            province,
            latitude,
            longitude,
            slug,
          })
          .select('id')
          .single()

        if (createError) {
          console.error('Create error:', createError)
          alert('Error: ' + createError.message + '\n\nMake sure you ran FINAL_MULTI_USER_SQL.sql!')
          throw createError
        }
        
        neighborhoodId = newNeighborhood.id
        console.log('✅ Created new neighborhood location')
      }

      // STEP 2: Check if THIS USER already reviewed this neighborhood
      const { data: existingReview, error: reviewSearchError } = await supabase
        .from('neighborhood_reviews')
        .select('id')
        .eq('neighborhood_id', neighborhoodId)
        .eq('user_id', currentUser.id)
        .maybeSingle()

      if (reviewSearchError && reviewSearchError.code !== 'PGRST116') {
        console.error('Review search error:', reviewSearchError)
        throw reviewSearchError
      }

      if (existingReview) {
        // User already reviewed - UPDATE their review
        console.log('✅ Updating your existing review...')
        
        // Recalculate average for update
        const updateAvgRating = (
          (ratings.find(r => r.id === 'safety')?.value || 0) +
          (ratings.find(r => r.id === 'cleanliness')?.value || 0) +
          (ratings.find(r => r.id === 'noise')?.value || 0) +
          (ratings.find(r => r.id === 'community')?.value || 0) +
          (ratings.find(r => r.id === 'transit')?.value || 0) +
          (ratings.find(r => r.id === 'amenities')?.value || 0)
        ) / 6

        const { error: updateError } = await supabase
          .from('neighborhood_reviews')
          .update({
            review: comment || 'No review text provided', // Required field
            overall_rating: Math.round(updateAvgRating), // Required field - round to integer
            safety: ratings.find(r => r.id === 'safety')?.value,
            cleanliness: ratings.find(r => r.id === 'cleanliness')?.value,
            noise: ratings.find(r => r.id === 'noise')?.value,
            community: ratings.find(r => r.id === 'community')?.value,
            transit: ratings.find(r => r.id === 'transit')?.value,
            amenities: ratings.find(r => r.id === 'amenities')?.value,
            comment: comment || null, // Keep for backwards compatibility
            is_anonymous: isAnonymous,
            display_name: !isAnonymous ? displayName : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)

        if (updateError) {
          console.error('Update error:', updateError)
          alert('Error updating review: ' + updateError.message)
          throw updateError
        }
        
        console.log('✅ Your review updated! (Trigger will recalculate average)')
      } else {
        // User hasn't reviewed yet - CREATE new review
        console.log('✅ Creating your new review...')
        
        // Calculate average rating
        const safetyVal = ratings.find(r => r.id === 'safety')?.value || 0
        const cleanlinessVal = ratings.find(r => r.id === 'cleanliness')?.value || 0
        const noiseVal = ratings.find(r => r.id === 'noise')?.value || 0
        const communityVal = ratings.find(r => r.id === 'community')?.value || 0
        const transitVal = ratings.find(r => r.id === 'transit')?.value || 0
        const amenitiesVal = ratings.find(r => r.id === 'amenities')?.value || 0
        const avgRating = (safetyVal + cleanlinessVal + noiseVal + communityVal + transitVal + amenitiesVal) / 6
        
        // Auto-approve if rating is 2 stars or higher, otherwise pending
        const reviewStatus = avgRating >= 2 ? 'approved' : 'pending'
        
        const { error: insertError } = await supabase
          .from('neighborhood_reviews')
          .insert({
            neighborhood_id: neighborhoodId,
            user_id: currentUser.id,
            review: comment || 'No review text provided', // Required field
            overall_rating: Math.round(avgRating), // Required field - round to integer
            safety: safetyVal,
            cleanliness: cleanlinessVal,
            noise: noiseVal,
            community: communityVal,
            transit: transitVal,
            amenities: amenitiesVal,
            comment: comment || null, // Keep for backwards compatibility
            is_anonymous: isAnonymous,
            display_name: !isAnonymous ? displayName : null,
            status: reviewStatus,
          })

        if (insertError) {
          console.error('Insert error:', insertError)
          alert('Error: ' + insertError.message + '\n\nMake sure you ran FINAL_MULTI_USER_SQL.sql!')
          throw insertError
        }
        
        console.log('✅ Your review created! (Trigger will calculate average)')
      }

    // Calculate average rating to determine if it needs approval
    const avgRating = (
      (ratings.find(r => r.id === 'safety')?.value || 0) +
      (ratings.find(r => r.id === 'cleanliness')?.value || 0) +
      (ratings.find(r => r.id === 'noise')?.value || 0) +
      (ratings.find(r => r.id === 'community')?.value || 0) +
      (ratings.find(r => r.id === 'transit')?.value || 0) +
      (ratings.find(r => r.id === 'amenities')?.value || 0)
    ) / 6

    // Show appropriate success message
    alert('✅ Rating Submitted Successfully!\n\n⏳ Your review is now pending admin approval.\n\nOur team will review it within 24 hours.\n\nYou will be notified once approved.\n\nThank you for contributing!')
    
    // Redirect to the newly created rating or explore
    router.push('/explore?success=pending')
    } catch (error: any) {
      console.error('❌ Error submitting rating:', error)
      alert('Error submitting rating:\n\n' + (error.message || error.toString() || 'Unknown error') + '\n\nCheck browser console for details.')
      setLoading(false)
    }
  }

  // Show loading state while checking auth
  if (userLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500 mb-4"></div>
              <p className="text-gray-600">Loading form...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rate a Neighborhood</h1>
              <p className="text-gray-600">Share your experience with the community</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Neighborhood Details</h2>
              
              <p className="text-gray-600 bg-primary-50 p-4 rounded-xl border border-primary-200">
                <strong>💡 Tip:</strong> Use the search below to find your neighborhood. It will auto-fill all the fields!
              </p>

            {isPreFilled ? (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating Neighborhood
                </label>
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{name}</p>
                      <p className="text-gray-600">{city}, {province}</p>
                      <p className="text-xs text-green-600 mt-2 font-medium">✓ Location automatically selected</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreFilled(false)}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Change location
                  </button>
                </div>
              </div>
            ) : (
              <PhotonAutocomplete
                placeholder="Search for a neighborhood in Canada..."
                onLocationSelect={(query, data) => {
                  if (data) {
                    setName(data.name || query)
                    setCity(data.city || '')
                    setProvince(data.province || '')
                    setLatitude(data.latitude || 0)
                    setLongitude(data.longitude || 0)
                  }
                }}
              />
            )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Neighborhood Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Auto-filled from search above (or type manually)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Auto-filled from search"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Auto-filled from search"
                  />
                </div>
              </div>
            </div>

            {/* Comment (Optional) */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">Your Review (Optional)</h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Share your experience... What do you like or dislike about this neighborhood? (Optional)"
              />
              <p className="text-xs text-gray-500">Help others by explaining your ratings</p>
            </div>

            {/* Anonymous Option */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Display Preference</h3>
              
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(true)}
                    className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Post Anonymously</p>
                    <p className="text-sm text-gray-600">Your review will show as "Anonymous User"</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isAnonymous}
                    onChange={() => setIsAnonymous(false)}
                    className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Show My Name</p>
                    <p className="text-sm text-gray-600">Your display name will be visible</p>
                  </div>
                </label>

                {!isAnonymous && (
                  <div className="ml-7 mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ratings */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Rate Your Neighborhood Experience</h2>
                <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-600 mt-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">How to Rate:</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li><strong>⭐ 1 Star:</strong> Very Poor - Major problems, not recommended</li>
                        <li><strong>⭐⭐ 2 Stars:</strong> Poor - Significant issues</li>
                        <li><strong>⭐⭐⭐ 3 Stars:</strong> Average - Acceptable with some concerns</li>
                        <li><strong>⭐⭐⭐⭐ 4 Stars:</strong> Good - Minor issues, generally satisfied</li>
                        <li><strong>⭐⭐⭐⭐⭐ 5 Stars:</strong> Excellent - Highly recommended!</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-3 bg-white/50 p-2 rounded">
                        💡 <strong>Tip:</strong> If a neighborhood already exists in our database, your rating will be added to it automatically - no duplicates!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ratings.map((category) => {
                  const descriptions: Record<string, string> = {
                    safety: 'How safe do you feel walking day and night?',
                    cleanliness: 'How clean are streets, parks, and public areas?',
                    noise: 'How quiet is it? Traffic, nightlife, construction noise?',
                    community: 'How friendly are neighbors? Community events?',
                    transit: 'Access to public transport, buses, subway, trains?',
                    amenities: 'Nearby shops, restaurants, parks, schools, services?'
                  }
                  
                  return (
                    <div key={category.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 transition-colors">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="text-primary-600">{category.icon}</div>
                        <span className="font-bold text-gray-900">{category.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-4">{descriptions[category.id]}</p>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(category.id, star)}
                            className="transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= category.value
                                  ? 'text-primary-500 fill-primary-500 drop-shadow'
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {category.value > 0 && (
                        <p className="text-sm font-semibold text-primary-600 mt-2">
                          {category.value === 5 ? '🎉 Excellent!' : 
                           category.value === 4 ? '👍 Good' : 
                           category.value === 3 ? '👌 Average' : 
                           category.value === 2 ? '⚠️ Poor' : 
                           '❌ Very Poor'}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Photos (Optional)</h2>
              <p className="text-gray-600">Upload up to 5 photos of the neighborhood</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || userLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] relative"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function RateNeighborhood() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div></div>}>
      <RateNeighborhoodForm />
    </Suspense>
  )
}

