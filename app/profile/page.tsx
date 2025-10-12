'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Star, MapPin, Building2, Calendar, Award, TrendingUp, Shield, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Neighborhood, Building } from '@/lib/supabase'
import UserRatingCard from '@/components/UserRatingCard'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [neighborhoodReviews, setNeighborhoodReviews] = useState<any[]>([])
  const [buildingReviews, setBuildingReviews] = useState<any[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    // Add overall timeout
    const timeout = setTimeout(() => {
      console.log('⚠️ Overall timeout - stopping all loading')
      setLoading(false)
    }, 5000)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        clearTimeout(timeout)
        setLoading(false)
        router.push('/login')
        return
      }

      setUser(session.user)
      
      // Check if admin (non-blocking)
      supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          setIsAdmin(data?.is_admin || false)
        })
        .catch(() => setIsAdmin(false))
      
      // Fetch ratings (this will set loading to false when done)
      fetchUserRatings(session.user.id, timeout)
    } catch (err) {
      clearTimeout(timeout)
      setLoading(false)
      router.push('/login')
    }
  }

  const fetchUserRatings = async (userId: string) => {
    try {
      // Fetch reviews
      const { data: nReviews } = await supabase
        .from('neighborhood_reviews')
        .select('*')
        .eq('user_id', userId)

      const { data: bReviews } = await supabase
        .from('building_reviews')
        .select('*')
        .eq('user_id', userId)

      // Get locations
      const nWithLocs = []
      if (nReviews && nReviews.length > 0) {
        for (const r of nReviews) {
          const { data: loc } = await supabase
            .from('neighborhoods')
            .select('*')
            .eq('id', r.neighborhood_id)
            .maybeSingle()
          if (loc) nWithLocs.push({ ...r, neighborhoods: loc })
        }
      }

      const bWithLocs = []
      if (bReviews && bReviews.length > 0) {
        for (const r of bReviews) {
          const { data: loc } = await supabase
            .from('buildings')
            .select('*')
            .eq('id', r.building_id)
            .maybeSingle()
          if (loc) bWithLocs.push({ ...r, buildings: loc })
        }
      }

      setNeighborhoodReviews(nWithLocs)
      setBuildingReviews(bWithLocs)
      setTotalViews((nWithLocs.length + bWithLocs.length) * 47)
      
    } catch (error) {
      console.error('Error fetching ratings:', error)
      setNeighborhoodReviews([])
      setBuildingReviews([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500 mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center ring-4 ring-primary-100">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.user_metadata?.full_name || 'User'}
              </h1>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-5 text-center border border-primary-100">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-primary-600 fill-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-primary-600">
                    {neighborhoodReviews.length + buildingReviews.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Total Reviews</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 text-center border border-blue-100">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {neighborhoodReviews.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Neighborhoods</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 text-center border border-green-100">
                  <div className="flex items-center justify-center mb-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {buildingReviews.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Buildings</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 text-center border border-purple-100">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600">
                    {totalViews}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Est. Views</div>
                </div>
              </div>
              
              {/* Role Badge */}
              <div className="mt-6 flex items-center space-x-3">
                <div className={`inline-flex items-center space-x-2 ${isAdmin ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'} border px-4 py-2 rounded-full`}>
                  <div className={`w-2 h-2 ${isAdmin ? 'bg-purple-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                  <Shield className={`w-4 h-4 ${isAdmin ? 'text-purple-600' : 'text-green-600'}`} />
                  <span className={`text-sm font-semibold ${isAdmin ? 'text-purple-700' : 'text-green-700'}`}>
                    {isAdmin ? 'Administrator' : 'Verified Account'}
                  </span>
                </div>
                
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors text-sm font-semibold"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Impact Notice */}
          <div className="mt-6 bg-gradient-to-r from-primary-50 to-orange-50 border-l-4 border-primary-500 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900">Your Impact</p>
                <p className="text-sm text-gray-600">
                  All your ratings are live and helping others make better housing decisions! 🎉
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User's Neighborhood Reviews */}
        {neighborhoodReviews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Neighborhood Reviews</h2>
              </div>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>{neighborhoodReviews.length} Active</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {neighborhoodReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  location={review.neighborhoods}
                  type="neighborhood"
                  onDelete={() => fetchUserRatings(user.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* User's Building Reviews */}
        {buildingReviews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Building Reviews</h2>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>{buildingReviews.length} Active</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildingReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  location={review.buildings}
                  type="building"
                  onDelete={() => fetchUserRatings(user.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {neighborhoodReviews.length === 0 && buildingReviews.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No Reviews Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start sharing your experiences! Rate neighborhoods and buildings to help others make informed decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/rate/neighborhood" className="btn-primary inline-flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Rate a Neighborhood</span>
              </Link>
              <Link href="/rate/building" className="btn-secondary inline-flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Rate a Building</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// Review Card Component
function ReviewCard({ review, location, type, onDelete }: any) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const avgRating = type === 'neighborhood'
    ? (review.safety + review.cleanliness + review.noise + review.community + review.transit + review.amenities) / 6
    : (review.management + review.cleanliness + review.maintenance + review.rent_value + review.noise + review.amenities) / 6

  const handleDelete = async () => {
    const table = type === 'neighborhood' ? 'neighborhood_reviews' : 'building_reviews'
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', review.id)
    
    if (!error) {
      onDelete()
    }
  }

  if (!location) return null

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100">
      {review.images && review.images.length > 0 && (
        <div className="h-48 relative overflow-hidden">
          <img
            src={review.images[0]}
            alt={location.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {review.images.length} {review.images.length === 1 ? 'Photo' : 'Photos'}
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{location.name}</h3>
            <p className="text-gray-600 text-sm flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{location.city}, {location.province}</span>
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
            <span className="font-bold text-primary-600">{avgRating.toFixed(1)}</span>
          </div>
        </div>

        {review.comment && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic">
            &quot;{review.comment}&quot;
          </p>
        )}

        {/* Status Badge */}
        {review.status && review.status === 'pending' && (
          <div className="mb-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-yellow-800">Under Admin Review</p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Reviews with 2 stars or less need admin approval to prevent abuse.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{location.total_reviews || 0} reviews</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {review.status === 'approved' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Live</span>
              </span>
            )}
            {review.is_anonymous ? (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Anonymous</span>
            ) : (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Public</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <Link
            href={type === 'neighborhood' ? `/neighborhood/${location.id}` : `/building/${location.id}`}
            className="flex-1 text-center px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-3">Are you sure you want to delete this review?</p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

