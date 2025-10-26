'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Upload, X, User, Users, Wrench, MessageSquare, Scale, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RatingCategory {
  id: string
  label: string
  icon: React.ReactNode
  value: number
}

export default function RateLandlord() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [yearsRented, setYearsRented] = useState<number>(0)
  const [monthlyRent, setMonthlyRent] = useState<number>(0)
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(false)

  const [ratings, setRatings] = useState<RatingCategory[]>([
    { id: 'responsiveness', label: 'Responsiveness', icon: <MessageSquare className="w-5 h-5" />, value: 0 },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" />, value: 0 },
    { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-5 h-5" />, value: 0 },
    { id: 'fairness', label: 'Fairness', icon: <Scale className="w-5 h-5" />, value: 0 },
    { id: 'professionalism', label: 'Professionalism', icon: <Briefcase className="w-5 h-5" />, value: 0 },
  ])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/rate/landlord')
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
    const newImages = [...images, ...files].slice(0, 5) // Max 5 images
    setImages(newImages)
    
    // Create previews
    const newPreviews = newImages.map(file => URL.createObjectURL(file))
    setImagePreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Separate review images from profile image
      const reviewImages = images.slice(1) // All except first
      const profileImageFile = images[0] // First image is profile
      
      let profileImageUrl: string | null = null
      let reviewImageUrls: string[] = []

      // Upload profile image if provided
      if (profileImageFile) {
        console.log('📤 Uploading profile image...')
        const fileExt = profileImageFile.name.split('.').pop()
        const fileName = `profile-${Date.now()}.${fileExt}`
        const filePath = `profiles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('landlord-images')
          .upload(filePath, profileImageFile)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('landlord-images')
            .getPublicUrl(filePath)
          profileImageUrl = publicUrl
          console.log('✅ Profile image uploaded:', profileImageUrl)
        }
      }

      // Upload review images
      if (reviewImages.length > 0) {
        console.log(`📤 Uploading ${reviewImages.length} review images...`)
        for (let i = 0; i < reviewImages.length; i++) {
          const file = reviewImages[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `landlord-reviews/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('landlord-images')
            .upload(filePath, file)

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('landlord-images')
              .getPublicUrl(filePath)
            reviewImageUrls.push(publicUrl)
          }
        }
        console.log('📸 Review images uploaded:', reviewImageUrls)
      }

      // Check if landlord already exists
      const { data: existingLandlord } = await supabase
        .from('landlords')
        .select('id')
        .eq('name', name)
        .eq('city', city)
        .eq('province', province)
        .single()

      let landlordId: string

      if (existingLandlord) {
        landlordId = existingLandlord.id
        // Update profile image if provided
        if (profileImageUrl) {
          await supabase
            .from('landlords')
            .update({ profile_image: profileImageUrl })
            .eq('id', landlordId)
        }
      } else {
        // Create new landlord
        const { data: newLandlord, error: landlordError } = await supabase
          .from('landlords')
          .insert({
            name,
            company_name: companyName || null,
            email: email || null,
            phone: phone || null,
            website: website || null,
            city,
            province,
            description: description || null,
            profile_image: profileImageUrl || null,
          })
          .select('id')
          .single()

        if (landlordError) {
          console.error('Landlord creation error:', landlordError)
          throw landlordError
        }

        landlordId = newLandlord.id
      }

      // Check if user already reviewed this landlord
      const { data: existingReview } = await supabase
        .from('landlord_reviews')
        .select('id')
        .eq('landlord_id', landlordId)
        .eq('user_id', user.id)
        .single()

      if (existingReview) {
        // Calculate average of all 5 ratings for overall_rating
        const avgRating = (
          (ratings.find(r => r.id === 'responsiveness')?.value || 0) +
          (ratings.find(r => r.id === 'maintenance')?.value || 0) +
          (ratings.find(r => r.id === 'communication')?.value || 0) +
          (ratings.find(r => r.id === 'fairness')?.value || 0) +
          (ratings.find(r => r.id === 'professionalism')?.value || 0)
        ) / 5

        // Update existing review
        const { error: updateError } = await supabase
          .from('landlord_reviews')
          .update({
            title: comment ? comment.substring(0, 100) : null,
            review: comment,
            overall_rating: Math.round(avgRating), // Round to integer
            responsiveness: Math.round(ratings.find(r => r.id === 'responsiveness')?.value || 0),
            maintenance: Math.round(ratings.find(r => r.id === 'maintenance')?.value || 0),
            communication: Math.round(ratings.find(r => r.id === 'communication')?.value || 0),
            fairness: Math.round(ratings.find(r => r.id === 'fairness')?.value || 0),
            professionalism: Math.round(ratings.find(r => r.id === 'professionalism')?.value || 0),
            is_anonymous: isAnonymous,
            display_name: !isAnonymous ? displayName : null,
            images: reviewImageUrls.length > 0 ? reviewImageUrls : null,
          })
          .eq('id', existingReview.id)

        console.log('📝 Updated existing review with images:', reviewImageUrls)

        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }
      } else {
        // Calculate average of all 5 ratings for overall_rating
        const avgRating = (
          (ratings.find(r => r.id === 'responsiveness')?.value || 0) +
          (ratings.find(r => r.id === 'maintenance')?.value || 0) +
          (ratings.find(r => r.id === 'communication')?.value || 0) +
          (ratings.find(r => r.id === 'fairness')?.value || 0) +
          (ratings.find(r => r.id === 'professionalism')?.value || 0)
        ) / 5

        // Create new review
        const { error: insertError } = await supabase
          .from('landlord_reviews')
          .insert({
            landlord_id: landlordId,
            user_id: user.id,
            title: comment ? comment.substring(0, 100) : null,
            review: comment,
            overall_rating: Math.round(avgRating), // Round to integer
            responsiveness: Math.round(ratings.find(r => r.id === 'responsiveness')?.value || 0),
            maintenance: Math.round(ratings.find(r => r.id === 'maintenance')?.value || 0),
            communication: Math.round(ratings.find(r => r.id === 'communication')?.value || 0),
            fairness: Math.round(ratings.find(r => r.id === 'fairness')?.value || 0),
            professionalism: Math.round(ratings.find(r => r.id === 'professionalism')?.value || 0),
            is_anonymous: isAnonymous,
            display_name: !isAnonymous ? displayName : null,
            images: reviewImageUrls.length > 0 ? reviewImageUrls : null,
          })

        console.log('📝 Created new review with images:', reviewImageUrls)

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
      }

      // Calculate average rating to determine if it needs approval
      const avgRating = (
        (ratings.find(r => r.id === 'responsiveness')?.value || 0) +
        (ratings.find(r => r.id === 'maintenance')?.value || 0) +
        (ratings.find(r => r.id === 'communication')?.value || 0) +
        (ratings.find(r => r.id === 'fairness')?.value || 0) +
        (ratings.find(r => r.id === 'professionalism')?.value || 0)
      ) / 5

      // Show appropriate success message
      if (avgRating >= 3) {
        alert('✅ Landlord Rating Submitted Successfully!\n\n🎉 Your review has been APPROVED and is now LIVE!\n\nOther users can now see your review.\n\nThank you for contributing!')
      } else {
        alert('✅ Landlord Rating Submitted Successfully!\n\n⏳ Your review is under admin review.\n\nWhy? Reviews with 2 stars or less need admin approval to prevent abuse.\n\nYou will be notified once approved.\n\nThank you for your honest feedback!')
      }
      
      router.push('/explore?success=true')
    } catch (error: any) {
      console.error('❌ Error submitting rating:', error)
      alert('Error submitting rating:\n\n' + (error.message || error.toString() || 'Unknown error') + '\n\nCheck browser console for details.')
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate a Landlord</h1>
            <p className="text-gray-600">Share your experience with a landlord to help other renters</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Landlord Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-2" />
                Landlord Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landlord Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Smith Properties"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="landlord@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Toronto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Province</option>
                    <option value="Ontario">Ontario</option>
                    <option value="Quebec">Quebec</option>
                    <option value="British Columbia">British Columbia</option>
                    <option value="Alberta">Alberta</option>
                    <option value="Manitoba">Manitoba</option>
                    <option value="Saskatchewan">Saskatchewan</option>
                    <option value="Nova Scotia">Nova Scotia</option>
                    <option value="New Brunswick">New Brunswick</option>
                    <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                    <option value="Prince Edward Island">Prince Edward Island</option>
                    <option value="Northwest Territories">Northwest Territories</option>
                    <option value="Nunavut">Nunavut</option>
                    <option value="Yukon">Yukon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the landlord or company..."
                />
              </div>

              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload a photo of the landlord</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="landlord-profile-image"
                  />
                  <label
                    htmlFor="landlord-profile-image"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG, or WebP (max 5MB)</p>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <div className="relative">
                        <img
                          src={imagePreviews[0]}
                          alt="Profile preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImages([])
                            setImagePreviews([])
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Categories */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Star className="w-6 h-6 mr-2" />
                Rate the Landlord
              </h2>
              
              <div className="space-y-4">
                {ratings.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <span className="font-medium text-gray-900">{category.label}</span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(category.id, star)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            star <= category.value
                              ? 'bg-yellow-400 text-yellow-900'
                              : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years Rented
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsRented}
                    onChange={(e) => setYearsRented(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={wouldRecommend}
                  onChange={(e) => setWouldRecommend(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="wouldRecommend" className="text-sm font-medium text-gray-700">
                  I would recommend this landlord to others
                </label>
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Review</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience *
                </label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell others about your experience with this landlord..."
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Additional Photos (Optional)</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload additional photos of the property or landlord interactions</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-2">Max 5 images, 10MB each</p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="anonymous"
                    name="privacy"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                    Post anonymously
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="public"
                    name="privacy"
                    checked={!isAnonymous}
                    onChange={() => setIsAnonymous(false)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="public" className="text-sm font-medium text-gray-700">
                    Post with my name
                  </label>
                </div>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How you'd like to appear"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Landlord Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
