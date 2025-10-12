'use client'

import { useState, useEffect } from 'react'
import { Shield, Star, Users, MapPin, Building2, Clock, TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    totalNeighborhoods: 0,
    totalBuildings: 0,
    lowRatings: 0,
  })

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    // Simple admin check
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, email')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      alert('Access denied. Admin only.')
      router.push('/')
      return
    }

    setUserEmail(profile.email || session.user.email || '')
    fetchStats()
  }

  const fetchStats = async () => {
    // Fetch users
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id')

    // Fetch all reviews
    const { data: nReviews } = await supabase
      .from('neighborhood_reviews')
      .select('id, status, safety, cleanliness, noise, community, transit, amenities')
    
    const { data: bReviews } = await supabase
      .from('building_reviews')
      .select('id, status, management, cleanliness, maintenance, rent_value, noise, amenities')

    // Fetch locations
    const { data: neighborhoods } = await supabase
      .from('neighborhoods')
      .select('id')

    const { data: buildings } = await supabase
      .from('buildings')
      .select('id')

    const allReviews = [...(nReviews || []), ...(bReviews || [])]
    const pending = allReviews.filter(r => r.status === 'pending').length
    const approved = allReviews.filter(r => r.status === 'approved').length
    const rejected = allReviews.filter(r => r.status === 'rejected').length

    // Count low ratings (< 2 stars)
    const lowRatingsCount = [
      ...(nReviews || []).filter(r => {
        const avg = (r.safety + r.cleanliness + r.noise + r.community + r.transit + r.amenities) / 6
        return avg < 2
      }),
      ...(bReviews || []).filter(r => {
        const avg = (r.management + r.cleanliness + r.maintenance + r.rent_value + r.noise + r.amenities) / 6
        return avg < 2
      }),
    ].length

    setStats({
      totalUsers: users?.length || 0,
      totalReviews: allReviews.length,
      pendingReviews: pending,
      approvedReviews: approved,
      rejectedReviews: rejected,
      totalNeighborhoods: neighborhoods?.length || 0,
      totalBuildings: buildings?.length || 0,
      lowRatings: lowRatingsCount,
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor and manage your NeighborhoodRank platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-blue-600" />
            <span className="text-xs text-gray-500">Registered</span>
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-1">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-10 h-10 text-yellow-600" />
            <span className="text-xs text-gray-500">Awaiting</span>
          </div>
          <div className="text-4xl font-bold text-yellow-600 mb-1">{stats.pendingReviews}</div>
          <div className="text-sm text-gray-600">Pending Reviews</div>
          {stats.pendingReviews > 0 && (
            <Link
              href="/admin/pending"
              className="mt-3 block text-center bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-all text-xs font-semibold"
            >
              Review Now →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-10 h-10 text-green-600" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
          <div className="text-4xl font-bold text-green-600 mb-1">{stats.approvedReviews}</div>
          <div className="text-sm text-gray-600">Approved Reviews</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
            <span className="text-xs text-gray-500">Flagged</span>
          </div>
          <div className="text-4xl font-bold text-red-600 mb-1">{stats.lowRatings}</div>
          <div className="text-sm text-gray-600">Low Ratings (&lt;2★)</div>
          {stats.lowRatings > 0 && (
            <Link
              href="/admin/pending"
              className="mt-3 block text-center bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-all text-xs font-semibold"
            >
              Review Now →
            </Link>
          )}
        </div>
      </div>

      {/* Locations Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-5xl font-bold mb-2">{stats.totalNeighborhoods}</div>
              <div className="text-blue-100">Neighborhoods</div>
            </div>
            <MapPin className="w-16 h-16 text-white/30" />
          </div>
          <Link
            href="/admin/neighborhoods"
            className="block text-center bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Manage Cover Images →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-5xl font-bold mb-2">{stats.totalBuildings}</div>
              <div className="text-green-100">Buildings</div>
            </div>
            <Building2 className="w-16 h-16 text-white/30" />
          </div>
          <Link
            href="/admin/buildings"
            className="block text-center bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Manage Cover Images →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/pending"
            className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 hover:border-yellow-400 transition-all group"
          >
            <Clock className="w-10 h-10 text-yellow-600 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Review Pending</h3>
            <p className="text-sm text-gray-600 mb-3">Approve or reject submissions</p>
            <span className="text-yellow-600 font-semibold text-sm group-hover:underline">
              {stats.pendingReviews} waiting →
            </span>
          </Link>

          <Link
            href="/admin/users"
            className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 hover:border-primary-400 transition-all group"
          >
            <Users className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600 mb-3">Grant or revoke admin access</p>
            <span className="text-primary-600 font-semibold text-sm group-hover:underline">
              {stats.totalUsers} users →
            </span>
          </Link>

          <Link
            href="/admin/neighborhoods"
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 transition-all group"
          >
            <MapPin className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Manage Locations</h3>
            <p className="text-sm text-gray-600 mb-3">Upload cover images</p>
            <span className="text-blue-600 font-semibold text-sm group-hover:underline">
              View all →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
