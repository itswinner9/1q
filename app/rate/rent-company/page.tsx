'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Upload, X, Building2, DollarSign, MessageSquare, Shield, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RatingCategory {
  id: string
  label: string
  icon: React.ReactNode
  value: number
}

export default function RateRentCompany() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [yearsUsed, setYearsUsed] = useState<number>(0)
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(false)

  const [ratings, setRatings] = useState<RatingCategory[]>([
    { id: 'service', label: 'Service Quality', icon: <Building2 className="w-5 h-5" />, value: 0 },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-5 h-5" />, value: 0 },
    { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-5 h-5" />, value: 0 },
    { id: 'reliability', label: 'Reliability', icon: <Shield className="w-5 h-5" />, value: 0 },
    { id: 'professionalism', label: 'Professionalism', icon: <Briefcase className="w-5 h-5" />, value: 0 },
  ])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/rate/rent-company')
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
      // Upload images to Supabase storage
      let imageUrls: string[] = []
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `rent-company-reviews/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('reviews')
            .upload(filePath, file)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            throw uploadError
          }

          const { data: { publicUrl } } = supabase.storage
            .from('reviews')
            .getPublicUrl(filePath)

          imageUrls.push(publicUrl)
        }
      }

      // Check if rent company already exists
      const { data: existingCompany } = await supabase
        .from('rent_companies')
        .select('id')
        .eq('name', name)
        .eq('city', city)
        .eq('province', province)
        .single()

      let companyId: string

      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        // Create new rent company
        const { data: newCompany, error: companyError } = await supabase
          .from('rent_companies')
          .insert({
            name,
            website: website || null,
            phone: phone || null,
            email: email || null,
            city,
            province,
            description: description || null,
          })
          .select('id')
          .single()

        if (companyError) {
          console.error('Company creation error:', companyError)
          throw companyError
        }

        companyId = newCompany.id
      }

      // Check if user already reviewed this company
      const { data: existingReview } = await supabase
        .from('rent_company_reviews')
        .select('id')
        .eq('rent_company_id', companyId)
        .eq('user_id', user.id)
        .single()

      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('rent_company_reviews')
          .update({
            title: comment ? comment.substring(0, 100) : null,
            review: comment,
            pros: null,
            cons: null,
            overall_rating: ratings.find(r => r.id === 'service')?.value || 0,
            service_rating: ratings.find(r => r.id === 'service')?.value || 0,
            pricing_rating: ratings.find(r => r.id === 'pricing')?.value || 0,
            communication_rating: ratings.find(r => r.id === 'communication')?.value || 0,
            reliability_rating: ratings.find(r => r.id === 'reliability')?.value || 0,
            professionalism_rating: ratings.find(r => r.id === 'professionalism')?.value || 0,
            years_used: yearsUsed || null,
            would_recommend: wouldRecommend,
            is_anonymous: isAnonymous,
            display_name: !isAnonymous ? displayName : null,
          })
          .eq('id', existingReview.id)

        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }
      } else {
        // Create new review
        const { error: insertError } = await supabase
          .from('rent_company_reviews')
          .insert({
            rent_company_id: companyId,
            user_id: user.id,
            title: comment ? comment.substring(0, 100) : null,
            review: comment,
            pros: null,
            cons: null,
            overall_rating: ratings.find(r => r.id === 'service')?.value || 0,
            service_rating: ratings.find(r => r.id === 'service')?.value || 0,
            pricing_rating: ratings.find(r => r.id === 'pricing')?.value || 0,
            communication_rating: ratings.find(r => r.id === 'communication')?.value || 0,
            reliability_rating: ratings.find(r => r.id === 'reliability')?.value || 0,
            professionalism_rating: ratings.find(r => r.id === 'professionalism')?.value || 0,
            years_used: yearsUsed || null,
            would_recommend: wouldRecommend,
            is_anonymous: isAnonymous,
            display_name: !isAnonymous ? displayName : null,
          })

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
      }

      // Calculate average rating to determine if it needs approval
      const avgRating = (
        (ratings.find(r => r.id === 'service')?.value || 0) +
        (ratings.find(r => r.id === 'pricing')?.value || 0) +
        (ratings.find(r => r.id === 'communication')?.value || 0) +
        (ratings.find(r => r.id === 'reliability')?.value || 0) +
        (ratings.find(r => r.id === 'professionalism')?.value || 0)
      ) / 5

      // Show appropriate success message
      if (avgRating >= 3) {
        alert('✅ Rent Company Rating Submitted Successfully!\n\n🎉 Your review has been APPROVED and is now LIVE!\n\nOther users can now see your review.\n\nThank you for contributing!')
      } else {
        alert('✅ Rent Company Rating Submitted Successfully!\n\n⏳ Your review is under admin review.\n\nWhy? Reviews with 2 stars or less need admin approval to prevent abuse.\n\nYou will be notified once approved.\n\nThank you for your honest feedback!')
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate a Rent Company</h1>
            <p className="text-gray-600">Share your experience with a rent company to help other renters</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="w-6 h-6 mr-2" />
                Company Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., RentEasy Properties"
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@example.com"
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
                  placeholder="Brief description of the company and their services..."
                />
              </div>
            </div>

            {/* Rating Categories */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Star className="w-6 h-6 mr-2" />
                Rate the Company
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years Used
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsUsed}
                  onChange={(e) => setYearsUsed(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
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
                  I would recommend this company to others
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
                  placeholder="Tell others about your experience with this rent company..."
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Photos (Optional)</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload photos related to your experience</p>
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
                {loading ? 'Submitting...' : 'Submit Company Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
