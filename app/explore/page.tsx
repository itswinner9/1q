'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Star, MapPin, Building2, Filter, UserCheck, Building, Grid, List, SortAsc, SortDesc, X, ChevronDown, Sparkles, TrendingUp, Award, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Neighborhood, Building } from '@/lib/supabase'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import SuccessNotification from '@/components/SuccessNotification'
import RatingCard from '@/components/RatingCard'

function ExploreContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || 'all'
  const showSuccess = searchParams.get('success') === 'true'
  const showPending = searchParams.get('success') === 'pending'

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'all' | 'neighborhoods' | 'buildings' | 'landlords' | 'rent-companies'>(
    initialType as any || 'all'
  )
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [landlords, setLandlords] = useState<any[]>([])
  const [rentCompanies, setRentCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotification, setShowNotification] = useState(showSuccess)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'newest'>('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minRating: 0,
    hasReviews: false,
    city: '',
    province: ''
  })

  useEffect(() => {
    fetchData()
  }, [searchQuery, activeTab, sortBy, filters])

  const fetchData = async () => {
    setLoading(true)

    try {
      if (activeTab === 'all' || activeTab === 'neighborhoods') {
        let query = supabase
          .from('neighborhoods')
          .select('*')

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,province.ilike.%${searchQuery}%`)
        }

        // Apply additional filters
        if (filters.minRating > 0) {
          query = query.gte('overall_rating', filters.minRating)
        }
        if (filters.hasReviews) {
          query = query.gt('total_reviews', 0)
        }
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`)
        }
        if (filters.province) {
          query = query.ilike('province', `%${filters.province}%`)
        }

        // Apply sorting
        if (sortBy === 'rating') {
          query = query.order('overall_rating', { ascending: false })
        } else if (sortBy === 'reviews') {
          query = query.order('total_reviews', { ascending: false })
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching neighborhoods:', error)
          setNeighborhoods([])
        } else {
          console.log('Fetched neighborhoods:', data?.length || 0)
          setNeighborhoods(data || [])
        }
      }

      if (activeTab === 'all' || activeTab === 'buildings') {
        let query = supabase
          .from('buildings')
          .select('*')

        if (searchQuery && searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,province.ilike.%${searchQuery}%`)
        }

        // Apply sorting
        if (sortBy === 'rating') {
          query = query.order('overall_rating', { ascending: false })
        } else if (sortBy === 'reviews') {
          query = query.order('total_reviews', { ascending: false })
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching buildings:', error)
          setBuildings([])
        } else {
          console.log('Fetched buildings:', data?.length || 0)
          setBuildings(data || [])
        }
      }

      if (activeTab === 'all' || activeTab === 'landlords') {
        let query = supabase
          .from('landlords')
          .select('*')

        if (searchQuery && searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,province.ilike.%${searchQuery}%`)
        }

        // Apply sorting
        if (sortBy === 'rating') {
          query = query.order('overall_rating', { ascending: false })
        } else if (sortBy === 'reviews') {
          query = query.order('total_reviews', { ascending: false })
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching landlords:', error)
          setLandlords([])
        } else {
          console.log('Fetched landlords:', data?.length || 0)
          setLandlords(data || [])
        }
      }

      if (activeTab === 'all' || activeTab === 'rent-companies') {
        let query = supabase
          .from('rent_companies')
          .select('*')

        if (searchQuery && searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,province.ilike.%${searchQuery}%`)
        }

        // Apply sorting
        if (sortBy === 'rating') {
          query = query.order('overall_rating', { ascending: false })
        } else if (sortBy === 'reviews') {
          query = query.order('total_reviews', { ascending: false })
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching rent companies:', error)
          setRentCompanies([])
        } else {
          console.log('Fetched rent companies:', data?.length || 0)
          setRentCompanies(data || [])
        }
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
      setNeighborhoods([])
      setBuildings([])
      setLandlords([])
      setRentCompanies([])
    }

    setLoading(false)
  }

  const handleSearch = (query: string, data?: any) => {
    setSearchQuery(query)
  }

  const totalCount = (activeTab === 'all' ? neighborhoods.length + buildings.length + landlords.length + rentCompanies.length : 
                      activeTab === 'neighborhoods' ? neighborhoods.length : 
                      activeTab === 'buildings' ? buildings.length :
                      activeTab === 'landlords' ? landlords.length : rentCompanies.length)

  const clearFilters = () => {
    setFilters({
      minRating: 0,
      hasReviews: false,
      city: '',
      province: ''
    })
    setSearchQuery('')
  }

  const getSortIcon = () => {
    switch (sortBy) {
      case 'rating': return <Star className="w-4 h-4" />
      case 'reviews': return <Users className="w-4 h-4" />
      case 'newest': return <Clock className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating': return 'Highest Rated'
      case 'reviews': return 'Most Reviews'
      case 'newest': return 'Newest First'
      default: return 'Highest Rated'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SuccessNotification
        show={showNotification}
        message="Your rating is now live and visible to everyone. Check it out below!"
        onClose={() => setShowNotification(false)}
      />
      
      {showPending && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md animate-slide-in-right">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Review Submitted</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your review is pending admin approval. You'll be notified once it's approved.
              </p>
            </div>
            <button
              onClick={() => window.history.replaceState({}, '', window.location.pathname)}
              className="ml-4 text-yellow-400 hover:text-yellow-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Compact Modern Hero Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-1">
                Explore <span className="bg-gradient-to-r from-primary-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">{totalCount.toLocaleString()}</span> Locations
              </h1>
              <p className="text-sm text-gray-600">
                Real reviews from real people
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>Verified Reviews</span>
            </div>
          </div>
        </div>

                {/* Compact Enhanced Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-5 mb-6 border border-gray-100">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                <SearchAutocomplete
                  onLocationSelect={handleSearch}
                  placeholder="Search locations, buildings, landlords..."
                  showIcon={true}
                />
              </div>
            </div>
          </div>

          {/* Compact Modern Tabs with Icons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>All</span>
              <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'all' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
              }`}>
                {neighborhoods.length + buildings.length + landlords.length + rentCompanies.length}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('neighborhoods')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'neighborhoods'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Neighborhoods</span>
              <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'neighborhoods' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
              }`}>
                {neighborhoods.length}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('buildings')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'buildings'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Buildings</span>
              <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'buildings' ? 'bg-white/20' : 'bg-green-100 text-green-600'
              }`}>
                {buildings.length}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('landlords')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'landlords'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Landlords</span>
              <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'landlords' ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
              }`}>
                {landlords.length}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('rent-companies')}
              className={`group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'rent-companies'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Rent Companies</span>
              <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'rent-companies' ? 'bg-white/20' : 'bg-orange-100 text-orange-600'
              }`}>
                {rentCompanies.length}
              </div>
            </button>
          </div>

          {/* Compact Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortBy(sortBy === 'rating' ? 'reviews' : sortBy === 'reviews' ? 'newest' : 'rating')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-all"
                  title="Sort options"
                >
                  {getSortIcon()}
                  <span>{getSortLabel()}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showFilters ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Clear Filters */}
              {(searchQuery || filters.minRating > 0 || filters.hasReviews || filters.city || filters.province) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Compact Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Min Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={1}>1+ Stars</option>
                    <option value={2}>2+ Stars</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    placeholder="Enter city..."
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Province</label>
                  <select
                    value={filters.province}
                    onChange={(e) => setFilters({...filters, province: e.target.value})}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any Province</option>
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
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.hasReviews}
                      onChange={(e) => setFilters({...filters, hasReviews: e.target.checked})}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Has Reviews Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding the best places for you...</h3>
                <p className="text-gray-600">Searching through our database</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Neighborhoods */}
            {(activeTab === 'all' || activeTab === 'neighborhoods') && neighborhoods.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {activeTab === 'all' ? 'Neighborhoods' : 'Results'}
                      </h2>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <span>{neighborhoods.length} location{neighborhoods.length !== 1 ? 's' : ''} found</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">Sorted by {getSortLabel().toLowerCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Award className="w-4 h-4" />
                    <span>Top Rated</span>
                  </div>
                </div>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                  {neighborhoods.map((neighborhood) => (
                    <RatingCard key={neighborhood.id} rating={neighborhood} type="neighborhood" viewMode={viewMode} />
                  ))}
                </div>
              </section>
            )}

            {/* Buildings */}
            {(activeTab === 'all' || activeTab === 'buildings') && buildings.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {activeTab === 'all' ? 'Buildings' : 'Results'}
                      </h2>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <span>{buildings.length} location{buildings.length !== 1 ? 's' : ''} found</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">Sorted by {getSortLabel().toLowerCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Award className="w-4 h-4" />
                    <span>Top Rated</span>
                  </div>
                </div>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                  {buildings.map((building) => (
                    <RatingCard key={building.id} rating={building} type="building" viewMode={viewMode} />
                  ))}
                </div>
              </section>
            )}

            {/* Landlords */}
            {(activeTab === 'all' || activeTab === 'landlords') && landlords.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {activeTab === 'all' ? 'Landlords' : 'Results'}
                      </h2>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <span>{landlords.length} landlord{landlords.length !== 1 ? 's' : ''} found</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">Sorted by {getSortLabel().toLowerCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Award className="w-4 h-4" />
                    <span>Top Rated</span>
                  </div>
                </div>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                  {landlords.map((landlord) => (
                    <Link key={landlord.id} href={`/landlord/${landlord.id}`}>
                      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-200 ${
                        viewMode === 'list' ? 'p-6 flex items-center space-x-6' : 'p-6'
                      }`}>
                        <div className={`${viewMode === 'list' ? 'flex-1' : 'flex items-start justify-between mb-4'}`}>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{landlord.name}</h3>
                            {landlord.company_name && (
                              <p className="text-sm text-gray-600 mb-2">{landlord.company_name}</p>
                            )}
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {landlord.city}, {landlord.province}
                            </p>
                            {landlord.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-2">{landlord.description}</p>
                            )}
                          </div>
                          <div className={`text-right ${viewMode === 'list' ? 'ml-4' : ''}`}>
                            <div className="text-2xl font-bold text-gray-900">{(landlord.overall_rating || 0).toFixed(1)}</div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (landlord.overall_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {landlord.total_reviews || 0} review{(landlord.total_reviews || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Rent Companies */}
            {(activeTab === 'all' || activeTab === 'rent-companies') && rentCompanies.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {activeTab === 'all' ? 'Rent Companies' : 'Results'}
                      </h2>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <span>{rentCompanies.length} compan{rentCompanies.length !== 1 ? 'ies' : 'y'} found</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">Sorted by {getSortLabel().toLowerCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Award className="w-4 h-4" />
                    <span>Top Rated</span>
                  </div>
                </div>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                  {rentCompanies.map((company) => (
                    <Link key={company.id} href={`/rent-company/${company.id}`}>
                      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-orange-200 ${
                        viewMode === 'list' ? 'p-6 flex items-center space-x-6' : 'p-6'
                      }`}>
                        <div className={`${viewMode === 'list' ? 'flex-1' : 'flex items-start justify-between mb-4'}`}>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {company.city}, {company.province}
                            </p>
                            {company.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-2">{company.description}</p>
                            )}
                          </div>
                          <div className={`text-right ${viewMode === 'list' ? 'ml-4' : ''}`}>
                            <div className="text-2xl font-bold text-gray-900">{(company.overall_rating || 0).toFixed(1)}</div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (company.overall_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {company.total_reviews || 0} review{(company.total_reviews || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Modern Empty States */}
            {activeTab === 'neighborhoods' && neighborhoods.length === 0 && !loading && (
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-12 lg:p-16 text-center shadow-2xl border border-blue-100">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No neighborhoods found</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                  {searchQuery ? `No neighborhoods match "${searchQuery}". Try a different search term.` : 'No neighborhoods have been added yet. Be the first to discover and rate one!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold shadow-lg transform hover:scale-105"
                    >
                      Clear Search
                    </button>
                  ) : (
                <Link
                      href="/rate/neighborhood"
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold shadow-lg transform hover:scale-105"
                >
                      Add First Neighborhood
                </Link>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'buildings' && buildings.length === 0 && !loading && (
              <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-12 lg:p-16 text-center shadow-2xl border border-green-100">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No buildings found</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                  {searchQuery ? `No buildings match "${searchQuery}". Try a different search term.` : 'No buildings have been added yet. Be the first to discover and rate one!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg transform hover:scale-105"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <Link
                      href="/rate/building"
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg transform hover:scale-105"
                    >
                      Add First Building
                    </Link>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'landlords' && landlords.length === 0 && !loading && (
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-12 lg:p-16 text-center shadow-2xl border border-purple-100">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <UserCheck className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No landlords found</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                  {searchQuery ? `No landlords match "${searchQuery}". Try a different search term.` : 'No landlords have been added yet. Be the first to discover and rate one!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all font-bold shadow-lg transform hover:scale-105"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <Link
                      href="/rate/landlord"
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all font-bold shadow-lg transform hover:scale-105"
                    >
                      Add First Landlord
                    </Link>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rent-companies' && rentCompanies.length === 0 && !loading && (
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-12 lg:p-16 text-center shadow-2xl border border-orange-100">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                    <Building className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No rent companies found</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                  {searchQuery ? `No rent companies match "${searchQuery}". Try a different search term.` : 'No rent companies have been added yet. Be the first to discover and rate one!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-lg transform hover:scale-105"
                    >
                      Clear Search
                    </button>
                  ) : (
                <Link
                      href="/rate/rent-company"
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-lg transform hover:scale-105"
                >
                      Add First Rent Company
                </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function Explore() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div></div>}>
      <ExploreContent />
    </Suspense>
  )
}


