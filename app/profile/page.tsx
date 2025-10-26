'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Calendar, Star, MapPin, Building2, Edit, Trash2, 
  Eye, Shield, Award, TrendingUp, Lock, LogOut, AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    setUser(session.user)

    // Get profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    setProfile(profileData)
    setFullName(profileData?.full_name || '')

    // Get user's reviews
    await fetchReviews(session.user.id)
    setLoading(false)
  }

  const fetchReviews = async (userId: string) => {
    const allReviews: any[] = []

    // Neighborhood reviews
    const { data: nReviews } = await supabase
      .from('neighborhood_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (nReviews) {
      for (const review of nReviews) {
        const { data: location } = await supabase
          .from('neighborhoods')
          .select('*')
          .eq('id', review.neighborhood_id)
          .single()

        if (location) {
          allReviews.push({
            ...review,
            type: 'neighborhood',
            location,
            avg: (review.safety + review.cleanliness + review.noise + review.community + review.transit + review.amenities) / 6
          })
        }
      }
    }

    // Building reviews
    const { data: bReviews } = await supabase
      .from('building_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bReviews) {
      for (const review of bReviews) {
        const { data: location } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', review.building_id)
          .single()

        if (location) {
          allReviews.push({
            ...review,
            type: 'building',
            location,
            avg: (review.management + review.cleanliness + review.maintenance + review.rent_value + review.noise + review.amenities) / 6
          })
        }
      }
    }

    setReviews(allReviews)
  }

  const handleUpdateProfile = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (!error) {
      alert('✅ Profile updated!')
      setEditing(false)
      checkUser()
    } else {
      alert('❌ Error: ' + error.message)
    }
  }

  const handleDeleteReview = async (reviewId: string, type: string) => {
    if (deleteConfirm !== reviewId) {
      setDeleteConfirm(reviewId)
      setTimeout(() => setDeleteConfirm(null), 5000) // Reset after 5 seconds
      return
    }

    setActionLoading(reviewId)
    
    const table = type === 'neighborhood' ? 'neighborhood_reviews' : 'building_reviews'
    
    console.log('🗑️ Deleting review:', reviewId, 'from', table)
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', reviewId)

    if (!error) {
      console.log('✅ Review deleted successfully!')
      alert('✅ Review deleted!')
      setDeleteConfirm(null)
      setActionLoading(null)
      fetchReviews(user.id)
    } else {
      console.error('❌ Delete error:', error)
      alert('❌ Error deleting review: ' + error.message)
      setActionLoading(null)
      setDeleteConfirm(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (!error) {
      alert('✅ Password reset email sent! Check your inbox.')
    } else {
      alert('❌ Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div>
      </div>
    )
  }

  const stats = {
    totalReviews: reviews.length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.avg, 0) / reviews.length).toFixed(1) : '0',
    neighborhoods: reviews.filter(r => r.type === 'neighborhood').length,
    buildings: reviews.filter(r => r.type === 'building').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-2xl lg:text-3xl font-bold text-gray-900 border-2 border-primary-500 rounded-lg px-3 py-2 w-full"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{profile?.full_name}</h1>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 gap-2 sm:gap-0">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {profile?.is_admin && (
                  <div className="mt-2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Admin</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              {editing ? (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    className="flex-1 md:flex-none bg-green-500 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-green-600 transition-all font-semibold text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setFullName(profile?.full_name || '')
                    }}
                    className="flex-1 md:flex-none bg-gray-500 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-gray-600 transition-all font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 md:flex-none bg-primary-500 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-primary-600 transition-all font-semibold flex items-center justify-center space-x-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary-600">{stats.totalReviews}</div>
              <div className="text-xs lg:text-sm text-primary-700 font-medium">Total Reviews</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-yellow-600">{stats.avgRating}★</div>
              <div className="text-xs lg:text-sm text-yellow-700 font-medium">Avg Rating</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-xs lg:text-sm text-green-700 font-medium">Published</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-xs lg:text-sm text-orange-700 font-medium">Pending</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleResetPassword}
            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left border border-gray-200 hover:border-blue-400 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Reset Password</h3>
                <p className="text-xs text-gray-600">Update your password</p>
              </div>
            </div>
          </button>

          {profile?.is_admin && (
            <Link
              href="/admin"
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Admin Panel</h3>
                  <p className="text-xs text-white/90">Manage platform</p>
                </div>
              </div>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left border border-gray-200 hover:border-red-400 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Sign Out</h3>
                <p className="text-xs text-gray-600">Log out of account</p>
              </div>
            </div>
          </button>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Your Reviews</h2>
              <p className="text-sm text-gray-600 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''} posted</p>
            </div>
            <Link
              href="/"
              className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-md"
            >
              <Star className="w-4 h-4" />
              <span>Write New Review</span>
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-6">Start sharing your experiences!</p>
              <Link
                href="/"
                className="inline-block bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-all font-semibold"
              >
                Write Your First Review
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 lg:p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {review.type === 'neighborhood' ? (
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900">{review.location.name}</h3>
                        <span className="text-sm text-gray-500">• {review.location.city}</span>
                        
                        {/* Status Badge */}
                        {review.status === 'approved' && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                            ✓ Live
                          </span>
                        )}
                        {review.status === 'pending' && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                            ⏳ Pending
                          </span>
                        )}
                        {review.status === 'rejected' && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                            ✗ Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-end">
                      <div className="px-4 py-2 rounded-xl shadow-md bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center space-x-2">
                        <Star className="w-5 h-5 fill-white" />
                        <span className="font-bold text-lg">{review.avg.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
                      <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
                    <Link
                      href={review.type === 'neighborhood' 
                        ? `/neighborhood/${review.location.slug || review.location.id}` 
                        : `/building/${review.location.slug || review.location.id}`
                      }
                      className="bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-center space-x-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    
                    <Link
                      href={review.type === 'neighborhood' 
                        ? `/neighborhood/${review.location.slug || review.location.id}` 
                        : `/building/${review.location.slug || review.location.id}`
                      }
                      target="_blank"
                      className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-all font-semibold flex items-center justify-center space-x-2 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteReview(review.id, review.type)}
                      disabled={actionLoading === review.id}
                      className={`px-4 py-2.5 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2 text-sm ${
                        deleteConfirm === review.id
                          ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {actionLoading === review.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Deleting...</span>
                        </>
                      ) : deleteConfirm === review.id ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>Confirm?</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
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
