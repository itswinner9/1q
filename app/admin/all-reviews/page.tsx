'use client'

import { useState, useEffect } from 'react'
import { 
  Star, MapPin, Building2, Users, Calendar, MessageCircle, Camera, 
  Eye, Trash2, EyeOff, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')

  useEffect(() => {
    fetchAllReviews()
  }, [])

  const fetchAllReviews = async () => {
    console.log('🔍 Fetching all reviews...')
    
    try {
      // Fetch neighborhood reviews
      const { data: nReviews, error: nError } = await supabase
        .from('neighborhood_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Neighborhood reviews:', nReviews?.length || 0, nError)

      // Fetch building reviews
      const { data: bReviews, error: bError } = await supabase
        .from('building_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Building reviews:', bReviews?.length || 0, bError)

      const allReviews: any[] = []

      // Process neighborhood reviews
      if (nReviews && nReviews.length > 0) {
        for (const review of nReviews) {
          const { data: neighborhood } = await supabase
            .from('neighborhoods')
            .select('*')
            .eq('id', review.neighborhood_id)
            .single()

          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('email, full_name')
            .eq('id', review.user_id)
            .single()

          if (neighborhood) {
            allReviews.push({
              ...review,
              type: 'neighborhood',
              location: neighborhood,
              user: userProfile || { email: 'Unknown', full_name: 'Unknown' },
              avg: (review.safety + review.cleanliness + review.noise + review.community + review.transit + review.amenities) / 6
            })
          }
        }
      }

      // Process building reviews
      if (bReviews && bReviews.length > 0) {
        for (const review of bReviews) {
          const { data: building } = await supabase
            .from('buildings')
            .select('*')
            .eq('id', review.building_id)
            .single()

          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('email, full_name')
            .eq('id', review.user_id)
            .single()

          if (building) {
            allReviews.push({
              ...review,
              type: 'building',
              location: building,
              user: userProfile || { email: 'Unknown', full_name: 'Unknown' },
              avg: (review.management + review.cleanliness + review.maintenance + review.rent_value + review.noise + review.amenities) / 6
            })
          }
        }
      }

      console.log('✅ Total reviews processed:', allReviews.length)
      setReviews(allReviews)
    } catch (err) {
      console.error('❌ Error fetching reviews:', err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: string, type: string) => {
    if (!confirm('⚠️ Are you sure you want to DELETE this review? This cannot be undone!')) {
      return
    }

    setActionLoading(reviewId)
    
    const table = type === 'neighborhood' ? 'neighborhood_reviews' : 'building_reviews'
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', reviewId)

    if (!error) {
      alert('✅ Review deleted successfully!')
      fetchAllReviews()
    } else {
      console.error('Delete error:', error)
      alert('❌ Error: ' + error.message)
    }
    
    setActionLoading(null)
  }

  const handleHide = async (reviewId: string, type: string, currentStatus: string) => {
    setActionLoading(reviewId)
    
    const table = type === 'neighborhood' ? 'neighborhood_reviews' : 'building_reviews'
    const newStatus = currentStatus === 'rejected' ? 'approved' : 'rejected'
    
    const { error } = await supabase
      .from(table)
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)

    if (!error) {
      alert(newStatus === 'rejected' ? '👁️ Review hidden!' : '✅ Review unhidden!')
      fetchAllReviews()
    } else {
      console.error('Hide error:', error)
      alert('❌ Error: ' + error.message)
    }
    
    setActionLoading(null)
  }

  const handleApprove = async (reviewId: string, type: string) => {
    setActionLoading(reviewId)
    
    const table = type === 'neighborhood' ? 'neighborhood_reviews' : 'building_reviews'
    
    const { error } = await supabase
      .from(table)
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)

    if (!error) {
      alert('✅ Review approved!')
      fetchAllReviews()
    } else {
      console.error('Approve error:', error)
      alert('❌ Error: ' + error.message)
    }
    
    setActionLoading(null)
  }

  const filteredReviews = reviews.filter(r => {
    if (filter === 'all') return true
    return r.status === filter
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Reviews</h1>
        <p className="text-gray-600">View, manage, hide or delete all reviews</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-2 inline-flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'all' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'approved' ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-50'
          }`}
        >
          ✓ Approved ({reviews.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'pending' ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-50'
          }`}
        >
          ⏳ Pending ({reviews.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'rejected' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'
          }`}
        >
          ✗ Hidden ({reviews.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews</h3>
          <p className="text-gray-600">No reviews match this filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:border-primary-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {review.type === 'neighborhood' ? (
                      <MapPin className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Building2 className="w-5 h-5 text-green-600" />
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{review.location.name}</h3>
                    <span className="text-sm text-gray-500">{review.location.city}</span>
                    
                    {/* Status Badge */}
                    {review.status === 'approved' && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        ✓ APPROVED
                      </span>
                    )}
                    {review.status === 'pending' && (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                        ⏳ PENDING
                      </span>
                    )}
                    {review.status === 'rejected' && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                        👁️ HIDDEN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>👤 {review.user?.email || 'Unknown'}</span>
                    <span>📅 {new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 rounded-xl shadow-md bg-primary-500 text-white">
                  <Star className="w-5 h-5 fill-white" />
                  <span className="font-bold text-lg">{review.avg.toFixed(1)}</span>
                </div>
              </div>

              {review.comment && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {review.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(review.id, review.type)}
                    disabled={actionLoading === review.id}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleHide(review.id, review.type, review.status)}
                  disabled={actionLoading === review.id}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {review.status === 'rejected' ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Unhide</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hide</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDelete(review.id, review.type)}
                  disabled={actionLoading === review.id}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                
                <Link
                  href={review.type === 'neighborhood' 
                    ? `/neighborhood/${review.location.slug || review.location.id}` 
                    : `/building/${review.location.slug || review.location.id}`
                  }
                  target="_blank"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all font-semibold flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


