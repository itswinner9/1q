'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Upload, X, Building2, Users, Sparkles, Wrench, DollarSign, Volume2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PhotonAutocomplete from '@/components/PhotonAutocomplete'

interface RatingCategory {
  id: string
  label: string
  icon: React.ReactNode
  value: number
}

export default function RateBuilding() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')

  const [ratings, setRatings] = useState<RatingCategory[]>([
    { id: 'management', label: 'Management', icon: <Users className="w-5 h-5" />, value: 0 },
    { id: 'cleanliness', label: 'Cleanliness', icon: <Sparkles className="w-5 h-5" />, value: 0 },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" />, value: 0 },
    { id: 'rent_value', label: 'Rent Value', icon: <DollarSign className="w-5 h-5" />, value: 0 },
    { id: 'noise', label: 'Noise Level', icon: <Volume2 className="w-5 h-5" />, value: 0 },
    { id: 'amenities', label: 'Amenities', icon: <Package className="w-5 h-5" />, value: 0 },
  ])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          setUserLoading(false)
          router.push('/login?redirect=/rate/building')
          return
        }
        
        if (!session) {
          console.log('No session found, redirecting to login')
          setUserLoading(false)
          router.push('/login?redirect=/rate/building')
          return
        }
        
        console.log('User authenticated:', session.user.email)
        setUser(session.user)
        setUserLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUserLoading(false)
        router.push('/login?redirect=/rate/building')
      }
    }
    
    checkAuth()
  }, [router])

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
    if (!name || !address || !city || !province) {
      alert('❌ Please fill in all building details')
      return
    }

    if (ratings.some(r => r.value === 0)) {
      alert('❌ Please rate all categories')
      return
    }
    
    // Double-check user is logged in
    console.log('Checking authentication before submit...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      alert('❌ Authentication error. Please try logging in again.')
      router.push('/login?redirect=/rate/building')
      return
    }
    
    if (!session || !session.user) {
      console.log('No session found')
      alert('❌ You must be logged in to submit a rating. Redirecting to login...')
      router.push('/login?redirect=/rate/building')
      return
    }
    
    console.log('✅ User authenticated:', session.user.email)
    const currentUser = session.user

    setLoading(true)

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `buildings/${currentUser.id}/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const { data, error } = await supabase.storage
          .from('building-images')
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
            .from('building-images')
            .getPublicUrl(fileName)
          
          if (urlData?.publicUrl) {
            imageUrls.push(urlData.publicUrl)
          }
        }
      }
      
      console.log('Uploaded image URLs:', imageUrls)

      // STEP 1: Check if building location exists (by address AND city)
      console.log('🔍 Checking if building exists:', address, city)
      
      // Try to find existing building by exact address match
      const { data: existingBuildings, error: searchError } = await supabase
        .from('buildings')
        .select('id, name, address')
        .ilike('address', address.trim())
        .ilike('city', city.trim())
        .limit(1)

      if (searchError) {
        console.error('❌ Search error:', searchError)
        throw searchError
      }

      let buildingId: string

      if (existingBuildings && existingBuildings.length > 0) {
        // Building exists - UPDATE it and use existing ID
        buildingId = existingBuildings[0].id
        console.log('✅ Found existing building:', existingBuildings[0].name)
        console.log('📝 Will add your review to this existing building')
        
        // Optionally update building info if new data is better
        // (e.g., if old name was incomplete and new one is full address)
        if (name && name.length > existingBuildings[0].name.length) {
          console.log('📝 Updating building name with more complete info...')
          await supabase
            .from('buildings')
            .update({ 
              name: name,
              latitude: latitude || existingBuildings[0].latitude,
              longitude: longitude || existingBuildings[0].longitude,
            })
            .eq('id', buildingId)
        }
      } else {
        // Building doesn't exist - CREATE new building
        console.log('✅ Creating new building location...')
        
        // Generate SEO-friendly slug from address
        const slug = `${address}-${city}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        const { data: newBuilding, error: createError } = await supabase
          .from('buildings')
          .insert({
            name: name || address, // Use full address as name if no name provided
            address,
            city,
            province,
            latitude,
            longitude,
            slug,
          })
          .select('id')
          .single()

        if (createError) {
          console.error('❌ Create error:', createError)
          alert('Error creating building: ' + createError.message + '\n\nPlease make sure the database is set up correctly.')
          throw createError
        }
        
        buildingId = newBuilding.id
        console.log('✅ Created new building with ID:', buildingId)
      }

      // STEP 2: Check if THIS USER already reviewed this building
      const { data: existingReview, error: reviewSearchError } = await supabase
        .from('building_reviews')
        .select('id')
        .eq('building_id', buildingId)
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
          (ratings.find(r => r.id === 'management')?.value || 0) +
          (ratings.find(r => r.id === 'cleanliness')?.value || 0) +
          (ratings.find(r => r.id === 'maintenance')?.value || 0) +
          (ratings.find(r => r.id === 'rent_value')?.value || 0) +
          (ratings.find(r => r.id === 'noise')?.value || 0) +
          (ratings.find(r => r.id === 'amenities')?.value || 0)
        ) / 6

        const { error: updateError } = await supabase
          .from('building_reviews')
          .update({
            review: comment || 'No review text provided', // Required field
            overall_rating: Math.round(updateAvgRating), // Required field - round to integer
            management: ratings.find(r => r.id === 'management')?.value,
            cleanliness: ratings.find(r => r.id === 'cleanliness')?.value,
            maintenance: ratings.find(r => r.id === 'maintenance')?.value,
            rent_value: ratings.find(r => r.id === 'rent_value')?.value,
            noise: ratings.find(r => r.id === 'noise')?.value,
            amenities: ratings.find(r => r.id === 'amenities')?.value,
            comment: comment || null, // Keep for backwards compatibility
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
        const managementVal = ratings.find(r => r.id === 'management')?.value || 0
        const cleanlinessVal = ratings.find(r => r.id === 'cleanliness')?.value || 0
        const maintenanceVal = ratings.find(r => r.id === 'maintenance')?.value || 0
        const rentValueVal = ratings.find(r => r.id === 'rent_value')?.value || 0
        const noiseVal = ratings.find(r => r.id === 'noise')?.value || 0
        const amenitiesVal = ratings.find(r => r.id === 'amenities')?.value || 0
        const avgRating = (managementVal + cleanlinessVal + maintenanceVal + rentValueVal + noiseVal + amenitiesVal) / 6
        
        // Auto-approve if rating is 2 stars or higher, otherwise pending
        const reviewStatus = avgRating >= 2 ? 'approved' : 'pending'
        
        const { error: insertError} = await supabase
          .from('building_reviews')
          .insert({
            building_id: buildingId,
            user_id: currentUser.id,
            review: comment || 'No review text provided', // Required field
            overall_rating: Math.round(avgRating), // Required field - round to integer
            management: managementVal,
            cleanliness: cleanlinessVal,
            maintenance: maintenanceVal,
            rent_value: rentValueVal,
            noise: noiseVal,
            amenities: amenitiesVal,
            comment: comment || null, // Keep for backwards compatibility
            images: imageUrls,
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
        (ratings.find(r => r.id === 'management')?.value || 0) +
        (ratings.find(r => r.id === 'cleanliness')?.value || 0) +
        (ratings.find(r => r.id === 'maintenance')?.value || 0) +
        (ratings.find(r => r.id === 'rent_value')?.value || 0) +
        (ratings.find(r => r.id === 'noise')?.value || 0) +
        (ratings.find(r => r.id === 'amenities')?.value || 0)
      ) / 6

      // Show appropriate success message
      if (avgRating >= 3) {
        alert('✅ Rating Submitted Successfully!\n\n🎉 Your review has been APPROVED and is now LIVE!\n\nOther users can now see your review.\n\nThank you for contributing!')
      } else {
        alert('✅ Rating Submitted Successfully!\n\n⏳ Your review is under admin review.\n\nWhy? Reviews with 2 stars or less need admin approval to prevent abuse.\n\nYou will be notified once approved.\n\nThank you for your honest feedback!')
      }
      
      router.push('/explore?success=true')
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
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rate an Apartment/Building</h1>
              <p className="text-gray-600">Share your experience with the community</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Building Details</h2>
              
              <p className="text-gray-600 bg-primary-50 p-4 rounded-xl border border-primary-200">
                <strong>💡 Tip:</strong> Use the search below to find your building address. It will auto-fill all the fields!
              </p>

              <PhotonAutocomplete
                placeholder="Search for a building address in Canada..."
                onLocationSelect={(query, data) => {
                  if (data) {
                    const fullAddress = data.address || query
                    setAddress(fullAddress)
                    
                    // Use full address as name if no specific building name
                    // This makes it easier to search later
                    const buildingName = data.name || fullAddress
                    setName(buildingName)
                    setCity(data.city || '')
                    setProvince(data.province || '')
                    setLatitude(data.latitude || 0)
                    setLongitude(data.longitude || 0)
                  }
                }}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Building/Condo Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Auto-filled from search (editable)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Auto-filled from search (editable)"
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
                placeholder="Share your experience... How is the management? Building quality? Value for rent? (Optional)"
              />
              <p className="text-xs text-gray-500">Help others by explaining your ratings</p>
            </div>

            {/* Privacy Options */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Privacy Options</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(true)}
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Post Anonymously</div>
                    <div className="text-sm text-gray-600">Your name won't be shown</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isAnonymous}
                    onChange={() => setIsAnonymous(false)}
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Show My Name</div>
                    <div className="text-sm text-gray-600">Display your identity</div>
                  </div>
                </label>
                
                {!isAnonymous && (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  />
                )}
              </div>
            </div>

            {/* Ratings */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Rate Your Building Experience</h2>
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
                        💡 <strong>Tip:</strong> If a building already exists in our database, your rating will be added to it automatically - no duplicates!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ratings.map((category) => {
                  const descriptions: Record<string, string> = {
                    management: 'How responsive and helpful is the property management?',
                    cleanliness: 'How clean are common areas, hallways, and building exterior?',
                    maintenance: 'How quickly are repairs handled? Building condition?',
                    rent_value: 'Is the rent fair for what you get?',
                    noise: 'How quiet is it? Any disturbances from neighbors or street?',
                    amenities: 'Quality of facilities: gym, parking, laundry, etc.'
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
              <p className="text-gray-600">Upload up to 5 photos of the building</p>

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
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

