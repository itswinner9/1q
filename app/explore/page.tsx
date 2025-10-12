'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Star, MapPin, Building2, Filter } from 'lucide-react'
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

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'all' | 'neighborhoods' | 'buildings'>(
    initialType as any || 'all'
  )
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotification, setShowNotification] = useState(showSuccess)

  useEffect(() => {
    fetchData()
  }, [searchQuery, activeTab])

  const fetchData = async () => {
    setLoading(true)

    try {
      if (activeTab === 'all' || activeTab === 'neighborhoods') {
        let query = supabase
          .from('neighborhoods')
          .select('*')
          .order('average_rating', { ascending: false })

        if (searchQuery && searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,province.ilike.%${searchQuery}%`)
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
          .order('average_rating', { ascending: false })

        if (searchQuery && searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,province.ilike.%${searchQuery}%`)
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
    } catch (error) {
      console.error('Error in fetchData:', error)
      setNeighborhoods([])
      setBuildings([])
    }

    setLoading(false)
  }

  const handleSearch = (query: string, data?: any) => {
    setSearchQuery(query)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <SuccessNotification
        show={showNotification}
        message="Your rating is now live and visible to everyone. Check it out below!"
        onClose={() => setShowNotification(false)}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Ratings</h1>
          
          <div className="mb-6">
            <div className="relative bg-gray-50 rounded-full p-2">
              <SearchAutocomplete
                onLocationSelect={handleSearch}
                placeholder="Search neighborhoods or buildings in Canada..."
                showIcon={true}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('neighborhoods')}
              className={`px-6 py-3 font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'neighborhoods'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>Neighborhoods</span>
            </button>
            <button
              onClick={() => setActiveTab('buildings')}
              className={`px-6 py-3 font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'buildings'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Buildings</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {/* Neighborhoods */}
            {(activeTab === 'all' || activeTab === 'neighborhoods') && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {activeTab === 'all' ? 'Neighborhoods' : `Found ${neighborhoods.length} Neighborhoods`}
                </h2>
                {neighborhoods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {neighborhoods.map((neighborhood) => (
                      <RatingCard key={neighborhood.id} rating={neighborhood} type="neighborhood" />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No neighborhoods found</p>
                  </div>
                )}
              </section>
            )}

            {/* Buildings */}
            {(activeTab === 'all' || activeTab === 'buildings') && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {activeTab === 'all' ? 'Buildings' : `Found ${buildings.length} Buildings`}
                </h2>
                {buildings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buildings.map((building) => (
                      <RatingCard key={building.id} rating={building} type="building" />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No buildings found</p>
                  </div>
                )}
              </section>
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


