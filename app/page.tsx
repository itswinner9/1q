'use client'

import { useState, useEffect } from 'react'
import { Search, Star, MapPin, Building2, TrendingUp, Award, Users, Camera, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Neighborhood, Building } from '@/lib/supabase'
import RateModal from '@/components/RateModal'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import RatingCard from '@/components/RatingCard'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showRateModal, setShowRateModal] = useState(false)
  const [topNeighborhoods, setTopNeighborhoods] = useState<Neighborhood[]>([])
  const [topBuildings, setTopBuildings] = useState<Building[]>([])

  useEffect(() => {
    fetchTopRated()
  }, [])

  const fetchTopRated = async () => {
    try {
      // Fetch top neighborhoods
      const { data: neighborhoods, error: nError } = await supabase
        .from('neighborhoods')
        .select('*')
        .order('average_rating', { ascending: false })
        .limit(6)

      if (nError) {
        console.error('Error fetching neighborhoods:', nError)
        setTopNeighborhoods([])
      } else {
        console.log('Fetched neighborhoods:', neighborhoods?.length || 0)
        setTopNeighborhoods(neighborhoods || [])
      }

      // Fetch top buildings
      const { data: buildings, error: bError } = await supabase
        .from('buildings')
        .select('*')
        .order('average_rating', { ascending: false })
        .limit(6)

      if (bError) {
        console.error('Error fetching buildings:', bError)
        setTopBuildings([])
      } else {
        console.log('Fetched buildings:', buildings?.length || 0)
        setTopBuildings(buildings || [])
      }
    } catch (error) {
      console.error('Error in fetchTopRated:', error)
      setTopNeighborhoods([])
      setTopBuildings([])
    }
  }

  const handleSearch = (query: string, data?: any) => {
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6 animate-fade-in">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">Trusted by thousands of renters</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
            Find Your Perfect
            <span className="text-primary-500"> Neighborhood</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up">
            Discover honest reviews and ratings for neighborhoods and apartments from real residents
          </p>

          {/* Search Bar with Mapbox Autocomplete */}
          <div className="max-w-3xl mx-auto mb-8 animate-scale-in">
            <div className="relative bg-white rounded-full shadow-lg p-2">
              <SearchAutocomplete
                onLocationSelect={handleSearch}
                placeholder="Search for neighborhoods or buildings in Canada..."
                showIcon={true}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
            <button
              onClick={() => setShowRateModal(true)}
              className="bg-primary-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center space-x-2"
            >
              <Star className="w-5 h-5" />
              <span>Rate Now</span>
            </button>
            <Link
              href="/explore"
              className="bg-white text-gray-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Explore Ratings
            </Link>
          </div>
        </div>
      </section>

      {/* Top Rated Neighborhoods */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Rated Neighborhoods</h2>
              <p className="text-gray-600">Discover the best places to live</p>
            </div>
            <Link href="/explore?type=neighborhoods" className="text-primary-500 font-semibold hover:text-primary-600 flex items-center space-x-2">
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Rated Buildings</h2>
              <p className="text-gray-600">Find the best apartments and condos</p>
            </div>
            <Link href="/explore?type=buildings" className="text-primary-500 font-semibold hover:text-primary-600 flex items-center space-x-2">
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

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why NeighborhoodRank?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Make informed decisions about where to live with real insights from people who know these neighborhoods best
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <FeatureCard
              icon={<Star className="w-8 h-8 text-primary-500" />}
              title="Honest Reviews"
              description="Real ratings from actual residents who live there every day"
              badge="Verified"
            />
            <FeatureCard
              icon={<MapPin className="w-8 h-8 text-primary-500" />}
              title="Detailed Ratings"
              description="Compare safety, cleanliness, noise, transit access, and more"
              badge="6+ Categories"
            />
            <FeatureCard
              icon={<Building2 className="w-8 h-8 text-primary-500" />}
              title="Building Reviews"
              description="Rate apartments, condos, and property management quality"
              badge="Buildings + Neighborhoods"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-primary-500" />}
              title="Community Driven"
              description="Multiple reviews per location with aggregated ratings"
              badge="Multi-User"
            />
            <FeatureCard
              icon={<Camera className="w-8 h-8 text-primary-500" />}
              title="Photo Uploads"
              description="See real photos from residents, not stock images"
              badge="Real Photos"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary-500" />}
              title="100% Privacy Protected"
              description="Choose to post anonymously or show your name - you're in control"
              badge="Your Choice"
            />
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-12 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-primary-100">Free to Use</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">6+</div>
                <div className="text-primary-100">Rating Categories</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">∞</div>
                <div className="text-primary-100">Reviews Per Location</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Trust Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 border-2 border-green-200">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Privacy is Our Priority</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We believe in honest reviews without compromising your privacy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 100% Anonymous Option */}
              <div className="bg-white rounded-2xl p-8 shadow-md border border-green-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">100% Anonymous Reviews</h3>
                    <p className="text-gray-600 mb-4">
                      Choose to post your reviews completely anonymously. Your identity stays private while your insights help others.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                      <Shield className="w-4 h-4" />
                      <span>Full privacy protection</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Users */}
              <div className="bg-white rounded-2xl p-8 shadow-md border border-green-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">All Users Verified</h3>
                    <p className="text-gray-600 mb-4">
                      Even anonymous reviewers must create an account. This prevents spam and abuse while maintaining your privacy.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium">
                      <Star className="w-4 h-4" />
                      <span>Verified & trusted reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Choice */}
              <div className="bg-white rounded-2xl p-8 shadow-md border border-green-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">You Decide</h3>
                    <p className="text-gray-600 mb-4">
                      Want recognition? Show your name. Prefer privacy? Stay anonymous. Change your preference anytime.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-purple-600 font-medium">
                      <Shield className="w-4 h-4" />
                      <span>Total control over your identity</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* No Abuse */}
              <div className="bg-white rounded-2xl p-8 shadow-md border border-green-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Abuse Prevention</h3>
                    <p className="text-gray-600 mb-4">
                      Each user can only review a location once. Account verification prevents fake reviews and spam.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-orange-600 font-medium">
                      <Shield className="w-4 h-4" />
                      <span>One review per user per location</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Shield className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Trusted & Secure Platform</h3>
              </div>
              <p className="text-green-100 max-w-2xl mx-auto">
                All reviews are from verified accounts. Anonymous users stay private, but everyone is authenticated to ensure quality and prevent abuse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showRateModal && <RateModal onClose={() => setShowRateModal(false)} />}
    </main>
  )
}


function FeatureCard({ icon, title, description, badge }: { icon: React.ReactNode; title: string; description: string; badge?: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 group">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {badge && (
        <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full mb-3">
          {badge}
        </span>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

