'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Upload, X, Building2, Users, Sparkles, Wrench, DollarSign, Volume2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import MapboxAutocomplete from '@/components/MapboxAutocomplete'

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
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [ratings, setRatings] = useState<RatingCategory[]>([
    { id: 'management', label: 'Management', icon: <Users className="w-5 h-5" />, value: 0 },
    { id: 'cleanliness', label: 'Cleanliness', icon: <Sparkles className="w-5 h-5" />, value: 0 },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" />, value: 0 },
    { id: 'rent_value', label: 'Rent Value', icon: <DollarSign className="w-5 h-5" />, value: 0 },
    { id: 'noise', label: 'Noise Level', icon: <Volume2 className="w-5 h-5" />, value: 0 },
    { id: 'amenities', label: 'Amenities', icon: <Package className="w-5 h-5" />, value: 0 },
  ])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/rate/building')
      } else {
        setUser(session.user)
      }
    })
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
    
    if (!user) {
      router.push('/login')
      return
    }

    if (!name || !address || !city || !province) {
      alert('Please fill in all building details')
      return
    }

    if (ratings.some(r => r.value === 0)) {
      alert('Please rate all categories')
      return
    }

    setLoading(true)

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `buildings/${user.id}/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
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

      // STEP 1: Check if building location exists
      console.log('Checking if building exists:', address, city)
      
      const { data: existingBuilding, error: searchError } = await supabase
        .from('buildings')
        .select('id')
        .ilike('address', address)
        .ilike('city', city)
        .maybeSingle()

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Search error:', searchError)
        throw searchError
      }

      let buildingId: string

      if (existingBuilding) {
        // Location exists - use it
        buildingId = existingBuilding.id
        console.log('✅ Building location exists')
      } else {
        // Location doesn't exist - create it
        console.log('✅ Creating new building location...')
        
        // Generate SEO-friendly slug
        const slug = `${name}-${city}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        const { data: newBuilding, error: createError } = await supabase
          .from('buildings')
          .insert({
            name,
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
          console.error('Create error:', createError)
          alert('Error: ' + createError.message + '\n\nMake sure you ran FINAL_MULTI_USER_SQL.sql!')
          throw createError
        }
        
        buildingId = newBuilding.id
        console.log('✅ Created new building location')
      }

      // STEP 2: Check if THIS USER already reviewed this building
      const { data: existingReview, error: reviewSearchError } = await supabase
        .from('building_reviews')
        .select('id')
        .eq('building_id', buildingId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (reviewSearchError && reviewSearchError.code !== 'PGRST116') {
        console.error('Review search error:', reviewSearchError)
        throw reviewSearchError
      }

      if (existingReview) {
        // User already reviewed - UPDATE their review
        console.log('✅ Updating your existing review...')
        
        const { error: updateError } = await supabase
          .from('building_reviews')
          .update({
            management: ratings.find(r => r.id === 'management')?.value,
            cleanliness: ratings.find(r => r.id === 'cleanliness')?.value,
            maintenance: ratings.find(r => r.id === 'maintenance')?.value,
            rent_value: ratings.find(r => r.id === 'rent_value')?.value,
            noise: ratings.find(r => r.id === 'noise')?.value,
            amenities: ratings.find(r => r.id === 'amenities')?.value,
            comment: comment || null,
            images: imageUrls,
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
        
        const { error: insertError} = await supabase
          .from('building_reviews')
          .insert({
            building_id: buildingId,
            user_id: user.id,
            management: ratings.find(r => r.id === 'management')?.value,
            cleanliness: ratings.find(r => r.id === 'cleanliness')?.value,
            maintenance: ratings.find(r => r.id === 'maintenance')?.value,
            rent_value: ratings.find(r => r.id === 'rent_value')?.value,
            noise: ratings.find(r => r.id === 'noise')?.value,
            amenities: ratings.find(r => r.id === 'amenities')?.value,
            comment: comment || null,
            images: imageUrls,
            is_anonymous: isAnonymous,
            display_name: !isAnonymous ? displayName : null,
            status: 'pending',
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
        ratings.find(r => r.id === 'management')?.value +
        ratings.find(r => r.id === 'cleanliness')?.value +
        ratings.find(r => r.id === 'maintenance')?.value +
        ratings.find(r => r.id === 'rent_value')?.value +
        ratings.find(r => r.id === 'noise')?.value +
        ratings.find(r => r.id === 'amenities')?.value
      ) / 6

      // Show appropriate success message
      if (avgRating >= 3) {
        alert('✅ Rating Submitted Successfully!\n\n🎉 Your review has been APPROVED and is now LIVE!\n\nOther users can now see your review.\n\nThank you for contributing!')
      } else {
        alert('✅ Rating Submitted Successfully!\n\n⏳ Your review is under admin review.\n\nWhy? Reviews with 2 stars or less need admin approval to prevent abuse.\n\nYou will be notified once approved.\n\nThank you for your honest feedback!')
      }
      
      router.push('/explore?success=true')
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Error submitting rating. Please try again.')
    } finally {
      setLoading(false)
    }
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

              <MapboxAutocomplete
                type="building"
                onLocationSelect={(data) => {
                  setAddress(data.address)
                  // Extract building name from address (first part)
                  const buildingName = data.name || data.address.split(',')[0]
                  setName(buildingName)
                  setCity(data.city)
                  setProvince(data.province)
                  setLatitude(data.latitude)
                  setLongitude(data.longitude)
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

            {/* Ratings */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Rate Categories</h2>
              <p className="text-gray-600">Click on stars to rate (1 = Poor, 5 = Excellent)</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ratings.map((category) => (
                  <div key={category.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="text-gray-600">{category.icon}</div>
                      <span className="font-semibold text-gray-900">{category.label}</span>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(category.id, star)}
                          className="transition-all duration-200 hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= category.value
                                ? 'text-primary-500 fill-primary-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
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

