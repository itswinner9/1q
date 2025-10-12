'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Building2, Users, Sparkles, Wrench, DollarSign, Volume2, Package, Calendar, ArrowLeft, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Building } from '@/lib/supabase'

export default function BuildingDetail() {
  const params = useParams()
  const router = useRouter()
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchBuilding(params.id as string)
    }
  }, [params.id])

  const fetchBuilding = async (idOrSlug: string) => {
    try {
      // Try to fetch by slug first (SEO-friendly), fallback to ID
      let query = supabase.from('buildings').select('*')
      
      // Check if it's a UUID or a slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
      
      if (isUUID) {
        query = query.eq('id', idOrSlug)
      } else {
        query = query.eq('slug', idOrSlug)
      }
      
      const { data, error } = await query.single()

      if (error || !data) {
        console.error('Error fetching building:', error)
        setBuilding(null)
        setLoading(false)
        return
      }

      setBuilding(data)
      setLoading(false)
    } catch (err) {
      console.error('Error in fetchBuilding:', err)
      setBuilding(null)
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (building?.images && building.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % (building.images?.length || 1))
    }
  }

  const prevImage = () => {
    if (building?.images && building.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? (building.images?.length || 1) - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500 mb-4"></div>
          <p className="text-gray-600">Loading building details...</p>
        </div>
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

  const categories = [
    { id: 'management', label: 'Management', icon: Users, value: building.management, color: 'text-blue-600' },
    { id: 'cleanliness', label: 'Cleanliness', icon: Sparkles, value: building.cleanliness, color: 'text-green-600' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, value: building.maintenance, color: 'text-orange-600' },
    { id: 'rent_value', label: 'Rent Value', icon: DollarSign, value: building.rent_value, color: 'text-emerald-600' },
    { id: 'noise', label: 'Noise Level', icon: Volume2, value: building.noise, color: 'text-purple-600' },
    { id: 'amenities', label: 'Amenities', icon: Package, value: building.amenities, color: 'text-pink-600' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/explore"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Explore</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Image Gallery */}
          {building.images && building.images.length > 0 && (
            <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={building.images[currentImageIndex]}
                alt={`${building.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {building.images.length > 1 && (
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
                    {building.images.map((_, index) => (
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
              <div className="mb-4 md:mb-0">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{building.name}</h1>
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg">{building.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{building.city}, {building.province}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Rated on {new Date(building.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 text-center">
                <div className="text-5xl font-bold text-primary-600 mb-2">
                  {building.average_rating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(building.average_rating)
                          ? 'text-primary-500 fill-primary-500'
                          : 'text-primary-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600 font-medium">Overall Rating</div>
              </div>
            </div>

            {/* Category Ratings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Ratings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div key={category.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`${category.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-gray-900">{category.label}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl font-bold text-gray-900">
                          {category.value}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all"
                              style={{ width: `${(category.value / 5) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">out of 5</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 p-8 bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Have experience with this building?
              </h3>
              <p className="text-gray-600 mb-6">
                Share your own rating and help others make informed decisions
              </p>
              <Link href="/rate/building" className="btn-primary inline-flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Rate This Building</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

