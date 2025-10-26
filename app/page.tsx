'use client'

import { useState, useEffect } from 'react'
import { Search, Star, MapPin, Building2, TrendingUp, Award, Users, Camera, Shield, User, UserCheck, Building, Heart, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Neighborhood, Building } from '@/lib/supabase'
import RateModal from '@/components/RateModal'
import PhotonAutocomplete from '@/components/PhotonAutocomplete'
import RatingCard from '@/components/RatingCard'
import WhyNeighborhoodRank from '@/components/WhyNeighborhoodRank'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showRateModal, setShowRateModal] = useState(false)
  const [topNeighborhoods, setTopNeighborhoods] = useState<Neighborhood[]>([])
  const [topBuildings, setTopBuildings] = useState<Building[]>([])
  const [topLandlords, setTopLandlords] = useState<any[]>([])
  const [topRentCompanies, setTopRentCompanies] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    totalLocations: 0
  })

  useEffect(() => {
    // Wrap in try-catch to prevent unhandled errors
    const loadData = async () => {
      try {
        await Promise.all([fetchTopRated(), fetchStats()])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: userCount, error: userError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      
      if (userError) {
        console.warn('Error fetching user count:', userError)
      }
      
      // Get total reviews (all categories)
      const { count: neighborhoodReviews, error: nReviewError } = await supabase
        .from('neighborhood_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
      
      if (nReviewError) {
        console.warn('Error fetching neighborhood reviews:', nReviewError)
      }
      
      const { count: buildingReviews, error: bReviewError } = await supabase
        .from('building_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
      
      if (bReviewError) {
        console.warn('Error fetching building reviews:', bReviewError)
      }

      const { count: landlordReviews, error: lReviewError } = await supabase
        .from('landlord_reviews')
        .select('*', { count: 'exact', head: true })
      
      if (lReviewError) {
        console.warn('Error fetching landlord reviews:', lReviewError)
      }

      const { count: rentCompanyReviews, error: rReviewError } = await supabase
        .from('rent_company_reviews')
        .select('*', { count: 'exact', head: true })
      
      if (rReviewError) {
        console.warn('Error fetching rent company reviews:', rReviewError)
      }
      
      // Get total locations (all categories)
      const { count: neighborhoodCount, error: nCountError } = await supabase
        .from('neighborhoods')
        .select('*', { count: 'exact', head: true })
      
      if (nCountError) {
        console.warn('Error fetching neighborhood count:', nCountError)
      }
      
      const { count: buildingCount, error: bCountError } = await supabase
        .from('buildings')
        .select('*', { count: 'exact', head: true })
      
      if (bCountError) {
        console.warn('Error fetching building count:', bCountError)
      }

      const { count: landlordCount, error: lCountError } = await supabase
        .from('landlords')
        .select('*', { count: 'exact', head: true })
      
      if (lCountError) {
        console.warn('Error fetching landlord count:', lCountError)
      }

      const { count: rentCompanyCount, error: rCountError } = await supabase
        .from('rent_companies')
        .select('*', { count: 'exact', head: true })
      
      if (rCountError) {
        console.warn('Error fetching rent company count:', rCountError)
      }
      
      setStats({
        totalUsers: userCount || 0,
        totalReviews: (neighborhoodReviews || 0) + (buildingReviews || 0) + (landlordReviews || 0) + (rentCompanyReviews || 0),
        totalLocations: (neighborhoodCount || 0) + (buildingCount || 0) + (landlordCount || 0) + (rentCompanyCount || 0)
      })
      
      console.log('✅ Stats fetched:', {
        users: userCount || 0,
        reviews: (neighborhoodReviews || 0) + (buildingReviews || 0),
        locations: (neighborhoodCount || 0) + (buildingCount || 0)
      })
    } catch (error) {
      console.error('❌ Error fetching stats:', error)
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalReviews: 0,
        totalLocations: 0
      })
    }
  }

  const fetchTopRated = async () => {
    try {
      console.log('🔍 Fetching all categories...')
      
      // Fetch ALL neighborhoods, sort by rating and reviews
      const { data: neighborhoods, error: nError } = await supabase
        .from('neighborhoods')
        .select('*')
        .order('overall_rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (nError) {
        console.error('❌ Error fetching neighborhoods:', nError)
        setTopNeighborhoods([])
      } else {
        console.log('✅ Fetched neighborhoods:', neighborhoods?.length || 0)
        setTopNeighborhoods(neighborhoods || [])
      }

      // Fetch ALL buildings, sort by rating and reviews
      const { data: buildings, error: bError } = await supabase
        .from('buildings')
        .select('*')
        .order('overall_rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (bError) {
        console.error('❌ Error fetching buildings:', bError)
        setTopBuildings([])
      } else {
        console.log('✅ Fetched buildings:', buildings?.length || 0)
        setTopBuildings(buildings || [])
      }

      // Fetch ALL landlords, sort by rating and reviews
      const { data: landlords, error: lError } = await supabase
        .from('landlords')
        .select('*')
        .order('overall_rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (lError) {
        console.error('❌ Error fetching landlords:', lError)
        setTopLandlords([])
      } else {
        console.log('✅ Fetched landlords:', landlords?.length || 0)
        setTopLandlords(landlords || [])
      }

      // Fetch ALL rent companies, sort by rating and reviews
      const { data: rentCompanies, error: rError } = await supabase
        .from('rent_companies')
        .select('*')
        .order('overall_rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (rError) {
        console.error('❌ Error fetching rent companies:', rError)
        setTopRentCompanies([])
      } else {
        console.log('✅ Fetched rent companies:', rentCompanies?.length || 0)
        setTopRentCompanies(rentCompanies || [])
      }
    } catch (error) {
      console.error('❌ Error in fetchTopRated:', error)
      setTopNeighborhoods([])
      setTopBuildings([])
      setTopLandlords([])
      setTopRentCompanies([])
    }
  }

  const handleSearch = (query: string, data?: any) => {
    console.log('Search triggered:', query, data)
    if (data && data.city) {
      // If we have location data, use city name for better search
      router.push(`/explore?q=${encodeURIComponent(data.city)}`)
    } else if (query.trim()) {
      // Otherwise use raw query
      router.push(`/explore?q=${encodeURIComponent(query)}`)
    }
  }

  const [rotatingText, setRotatingText] = useState(0)
  const rotatingWords = [
    { text: "Neighborhood", color: "text-primary-500", icon: MapPin },
    { text: "Apartment", color: "text-blue-500", icon: Building2 },
    { text: "Landlord", color: "text-purple-500", icon: UserCheck },
    { text: "Rent Company", color: "text-orange-500", icon: Building },
    { text: "Home", color: "text-green-500", icon: Shield },
    { text: "Community", color: "text-indigo-500", icon: Users }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingText((prev) => (prev + 1) % 6) // 6 words
    }, 3000) // Change every 3 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-orange-50 min-h-screen flex items-center px-4 overflow-hidden">
        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 py-6">
          {/* Premium Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 via-primary-500/10 to-orange-500/10 backdrop-blur-xl px-5 py-2 rounded-full border border-emerald-300/30 mb-6 hover:scale-105 transition-all animate-float shadow-lg">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-extrabold tracking-wide bg-gradient-to-r from-emerald-700 via-primary-700 to-orange-600 bg-clip-text text-transparent uppercase">
              🇨🇦 Join 10,000+ Happy Renters
            </span>
          </div>
          
          {/* Main Headline with Rotating Text */}
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight">
              <span className="block mb-3 animate-fade-in-up bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Find Your Perfect
              </span>
              <div className="relative inline-block h-16 sm:h-20 md:h-24">
                {rotatingWords.map((word, index) => {
                  const Icon = word.icon
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-700 ${
                        index === rotatingText
                          ? 'opacity-100 translate-y-0 scale-100'
                          : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
                      }`}
                    >
                      <div className={`relative`}>
                        <div className={`absolute inset-0 ${word.color.replace('text-', 'bg-')} opacity-20 blur-xl rounded-full`}></div>
                        <Icon className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${word.color} animate-bounce-slow drop-shadow-lg`} />
                      </div>
                      <span className={`${word.color} font-black drop-shadow-sm`}>
                        {word.text}
                      </span>
                    </div>
                  )
                })}
              </div>
            </h1>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 font-medium">
            Discover <span className="font-bold text-gray-900 relative">
              honest reviews
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400 opacity-50"></span>
            </span> from{' '}
            <span className="font-bold bg-gradient-to-r from-primary-600 to-orange-600 bg-clip-text text-transparent">
              real residents
            </span>
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto mb-8 animate-fade-in-up animation-delay-400">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-3 hover:shadow-2xl transition-all border-2 border-gray-100 group-hover:border-primary-200">
                <PhotonAutocomplete
                  onLocationSelect={handleSearch}
                  placeholder="Search neighborhoods, buildings, landlords, or rent companies..."
                  showIcon={true}
                  type="general"
                />
              </div>
            </div>
          </div>

          {/* Premium CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up animation-delay-600 px-4">
            <button
              onClick={() => setShowRateModal(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-500 shadow-xl hover:shadow-primary-500/50 flex items-center justify-center space-x-2 transform hover:scale-105 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Star className="relative w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span className="relative">Rate Your Place</span>
              <div className="relative ml-1 flex space-x-0.5">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping animation-delay-200"></div>
              </div>
            </button>
            
            <Link
              href="/explore"
              className="group relative overflow-hidden bg-white text-gray-900 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-primary-500 transform hover:scale-105 hover:-translate-y-0.5"
            >
              <span>Explore Ratings</span>
              <div className="transform group-hover:translate-x-1 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* Real-time Stats Bar */}
      <section className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-y border-gray-200 py-10 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center group cursor-default">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-4 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-primary-600 to-orange-600 bg-clip-text text-transparent mb-1">
                {stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : '12,847'}+
              </div>
              <div className="text-sm text-gray-600 font-bold uppercase tracking-wider">Active Users</div>
            </div>
            
            <div className="flex flex-col items-center group cursor-default">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-4 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {stats.totalReviews > 0 ? stats.totalReviews.toLocaleString() : '54,239'}+
              </div>
              <div className="text-sm text-gray-600 font-bold uppercase tracking-wider">Verified Reviews</div>
            </div>
            
            <div className="flex flex-col items-center group cursor-default">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mb-4 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                {stats.totalLocations > 0 ? stats.totalLocations.toLocaleString() : '3,942'}+
              </div>
              <div className="text-sm text-gray-600 font-bold uppercase tracking-wider">Locations Listed</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Rate Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Rate Everything That Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From neighborhoods to landlords, get honest reviews from real people to make informed decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Neighborhoods */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Neighborhoods</h3>
                <p className="text-gray-600 mb-6">Rate safety, walkability, transit, and community vibes</p>
                <div className="flex items-center text-sm text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Rate a Neighborhood</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Buildings */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-200">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Buildings</h3>
                <p className="text-gray-600 mb-6">Review management, maintenance, amenities, and value</p>
                <div className="flex items-center text-sm text-green-600 font-semibold group-hover:text-green-700">
                  <span>Rate a Building</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Landlords */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Landlords</h3>
                <p className="text-gray-600 mb-6">Rate responsiveness, communication, and fairness</p>
                <div className="flex items-center text-sm text-purple-600 font-semibold group-hover:text-purple-700">
                  <span>Rate a Landlord</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Rent Companies */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Rent Companies</h3>
                <p className="text-gray-600 mb-6">Review service quality, pricing, and reliability</p>
                <div className="flex items-center text-sm text-orange-600 font-semibold group-hover:text-orange-700">
                  <span>Rate a Company</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Neighborhoods */}
      <section className="py-12 lg:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {topNeighborhoods.length > 0 && topNeighborhoods.some(n => (n.total_reviews || 0) > 0)
                    ? 'Top Rated Neighborhoods' 
                    : 'Explore Neighborhoods'}
                </h2>
              </div>
              <p className="text-sm lg:text-base text-gray-600 ml-13">
                {topNeighborhoods.length > 0 && topNeighborhoods.some(n => (n.total_reviews || 0) > 0)
                  ? 'Discover the best places to live based on ratings and reviews'
                  : topNeighborhoods.length > 0
                    ? 'Browse neighborhoods and be the first to rate them'
                    : 'No neighborhoods yet - add one to get started!'}
              </p>
            </div>
            <Link 
              href="/explore?type=neighborhoods" 
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-semibold flex items-center space-x-2 shadow-md"
            >
              <span>View All</span>
              <Award className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topNeighborhoods.length > 0 ? (
              topNeighborhoods.map((neighborhood) => (
                <RatingCard key={neighborhood.id} rating={neighborhood} type="neighborhood" />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No neighborhoods rated yet. Be the first to rate!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Rated Buildings */}
      <section className="py-12 lg:py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {topBuildings.length > 0 && topBuildings.some(b => (b.total_reviews || 0) > 0)
                    ? 'Top Rated Buildings' 
                    : 'Explore Buildings'}
                </h2>
              </div>
              <p className="text-sm lg:text-base text-gray-600 ml-13">
                {topBuildings.length > 0 && topBuildings.some(b => (b.total_reviews || 0) > 0)
                  ? 'Find the best apartments and condos based on resident reviews'
                  : topBuildings.length > 0
                    ? 'Browse buildings and be the first to rate them'
                    : 'No buildings yet - add one to get started!'}
              </p>
            </div>
            <Link 
              href="/explore?type=buildings" 
              className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all font-semibold flex items-center space-x-2 shadow-md"
            >
              <span>View All</span>
              <Award className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topBuildings.length > 0 ? (
              topBuildings.map((building) => (
                <RatingCard key={building.id} rating={building} type="building" />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No buildings rated yet. Be the first to rate!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Rated Landlords */}
      <section className="py-12 lg:py-16 px-4 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {topLandlords.length > 0 && topLandlords.some(l => (l.total_reviews || 0) > 0)
                    ? 'Top Rated Landlords' 
                    : 'Explore Landlords'}
                </h2>
              </div>
              <p className="text-sm lg:text-base text-gray-600 ml-13">
                {topLandlords.length > 0 && topLandlords.some(l => (l.total_reviews || 0) > 0)
                  ? 'Find landlords with the best responsiveness and communication'
                  : topLandlords.length > 0
                    ? 'Browse landlords and be the first to rate them'
                    : 'No landlords yet - add one to get started!'}
              </p>
            </div>
            <Link 
              href="/explore?type=landlords" 
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-semibold flex items-center space-x-2 shadow-md"
            >
              <span>View All</span>
              <Award className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topLandlords.length > 0 ? (
              topLandlords.map((landlord) => (
                <Link key={landlord.id} href={`/landlord/${landlord.id}`}>
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-purple-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{landlord.name}</h3>
                        {landlord.company_name && (
                          <p className="text-sm text-gray-600 mb-2">{landlord.company_name}</p>
                        )}
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {landlord.city}, {landlord.province}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{landlord.overall_rating.toFixed(1)}</div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= landlord.overall_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {landlord.total_reviews} review{landlord.total_reviews !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    {landlord.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{landlord.description}</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No landlords rated yet. Be the first to rate!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Rated Rent Companies */}
      <section className="py-12 lg:py-16 px-4 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {topRentCompanies.length > 0 && topRentCompanies.some(r => (r.total_reviews || 0) > 0)
                    ? 'Top Rated Rent Companies' 
                    : 'Explore Rent Companies'}
                </h2>
              </div>
              <p className="text-sm lg:text-base text-gray-600 ml-13">
                {topRentCompanies.length > 0 && topRentCompanies.some(r => (r.total_reviews || 0) > 0)
                  ? 'Find companies with the best service quality and reliability'
                  : topRentCompanies.length > 0
                    ? 'Browse rent companies and be the first to rate them'
                    : 'No rent companies yet - add one to get started!'}
              </p>
            </div>
            <Link 
              href="/explore?type=rent-companies" 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold flex items-center space-x-2 shadow-md"
            >
              <span>View All</span>
              <Award className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRentCompanies.length > 0 ? (
              topRentCompanies.map((company) => (
                <Link key={company.id} href={`/rent-company/${company.id}`}>
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-orange-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {company.city}, {company.province}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{company.overall_rating.toFixed(1)}</div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= company.overall_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {company.total_reviews} review{company.total_reviews !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    {company.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{company.description}</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No rent companies rated yet. Be the first to rate!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why NeighborhoodRank Section */}
      <WhyNeighborhoodRank />

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-600 via-primary-700 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Share Your Experience?
          </h2>
          <p className="text-lg lg:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Help others make informed decisions by rating your neighborhood, building, landlord, or rent company
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={() => setShowRateModal(true)}
              className="group relative overflow-hidden bg-white text-primary-700 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <Star className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Start Rating Now</span>
            </button>
            
            <Link
              href="/explore"
              className="group relative overflow-hidden bg-primary-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 transform hover:scale-105 border-2 border-primary-400"
            >
              <span>Explore All Reviews</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm text-primary-200">Neighborhoods</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-primary-200">Buildings</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">200+</div>
              <div className="text-sm text-primary-200">Landlords</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <Building className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm text-primary-200">Rent Companies</div>
            </div>
          </div>
        </div>
      </section>

      {showRateModal && <RateModal onClose={() => setShowRateModal(false)} />}
    </main>
  )
}

