'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, MapPin, Phone, Mail, Globe, Building, DollarSign, MessageSquare, Shield, Briefcase, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface RentCompany {
  id: string
  name: string
  website: string | null
  phone: string | null
  email: string | null
  city: string
  province: string
  description: string | null
  overall_rating: number
  service_rating: number
  pricing_rating: number
  communication_rating: number
  reliability_rating: number
  professionalism_rating: number
  total_reviews: number
  created_at: string
}

interface Review {
  id: string
  title: string | null
  review: string
  pros: string | null
  cons: string | null
  overall_rating: number
  service_rating: number | null
  pricing_rating: number | null
  communication_rating: number | null
  reliability_rating: number | null
  professionalism_rating: number | null
  years_used: number | null
  would_recommend: boolean | null
  is_anonymous: boolean
  display_name: string | null
  created_at: string
}

export default function RentCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<RentCompany | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCompany()
    }
  }, [params.id])

  const fetchCompany = async () => {
    try {
      const { data: companyData, error: companyError } = await supabase
        .from('rent_companies')
        .select('*')
        .eq('id', params.id)
        .single()

      if (companyError) {
        console.error('Error fetching company:', companyError)
        return
      }

      setCompany(companyData)

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('rent_company_reviews')
        .select('*')
        .eq('rent_company_id', params.id)
        .order('created_at', { ascending: false })

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      } else {
        setReviews(reviewsData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const getRatingCategory = (rating: number) => {
    if (rating >= 4.5) return { text: 'Excellent', color: 'text-green-600' }
    if (rating >= 3.5) return { text: 'Good', color: 'text-blue-600' }
    if (rating >= 2.5) return { text: 'Average', color: 'text-yellow-600' }
    if (rating >= 1.5) return { text: 'Poor', color: 'text-orange-600' }
    return { text: 'Very Poor', color: 'text-red-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company details...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-6">The rent company you're looking for doesn't exist.</p>
          <Link
            href="/explore"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  const overallRating = getRatingCategory(company.overall_rating)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/explore"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Explore
        </Link>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{company.city}, {company.province}</span>
              </div>

              {company.description && (
                <p className="text-gray-700 mb-6">{company.description}</p>
              )}

              {/* Contact Information */}
              <div className="space-y-2">
                {company.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Rating */}
            <div className="mt-6 md:mt-0 md:ml-8 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {company.overall_rating.toFixed(1)}
              </div>
              <div className="mb-2">{renderStars(company.overall_rating)}</div>
              <div className={`text-sm font-medium ${overallRating.color}`}>
                {overallRating.text}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {company.total_reviews} review{company.total_reviews !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Rating Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Service Quality</span>
              </div>
              {renderStars(company.service_rating)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium">Pricing</span>
              </div>
              {renderStars(company.pricing_rating)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium">Communication</span>
              </div>
              {renderStars(company.communication_rating)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="font-medium">Reliability</span>
              </div>
              {renderStars(company.reliability_rating)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-indigo-600 mr-3" />
                <span className="font-medium">Professionalism</span>
              </div>
              {renderStars(company.professionalism_rating)}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Reviews ({reviews.length})
          </h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet. Be the first to review this company!</p>
              <Link
                href={`/rate/rent-company?company=${company.id}`}
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.is_anonymous ? 'Anonymous' : (review.display_name || 'Anonymous')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {renderStars(review.overall_rating)}
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-700 mb-4">{review.review}</p>
                  
                  {/* Review Details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    {review.service_rating && (
                      <div>
                        <span className="text-gray-500">Service:</span>
                        <div className="flex items-center">
                          {renderStars(review.service_rating)}
                        </div>
                      </div>
                    )}
                    {review.pricing_rating && (
                      <div>
                        <span className="text-gray-500">Pricing:</span>
                        <div className="flex items-center">
                          {renderStars(review.pricing_rating)}
                        </div>
                      </div>
                    )}
                    {review.communication_rating && (
                      <div>
                        <span className="text-gray-500">Communication:</span>
                        <div className="flex items-center">
                          {renderStars(review.communication_rating)}
                        </div>
                      </div>
                    )}
                    {review.reliability_rating && (
                      <div>
                        <span className="text-gray-500">Reliability:</span>
                        <div className="flex items-center">
                          {renderStars(review.reliability_rating)}
                        </div>
                      </div>
                    )}
                    {review.professionalism_rating && (
                      <div>
                        <span className="text-gray-500">Professionalism:</span>
                        <div className="flex items-center">
                          {renderStars(review.professionalism_rating)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    {review.years_used && (
                      <span>Used for {review.years_used} year{review.years_used !== 1 ? 's' : ''}</span>
                    )}
                    {review.would_recommend !== null && (
                      <span className={review.would_recommend ? 'text-green-600' : 'text-red-600'}>
                        {review.would_recommend ? 'Would recommend' : 'Would not recommend'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
