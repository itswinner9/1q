'use client'

import { useState } from 'react'
import { X, MapPin, Building2, Shield, Users, Star, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface RateModalProps {
  onClose: () => void
}

export default function RateModal({ onClose }: RateModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })
  })

  const handleChoice = (type: 'neighborhood' | 'building') => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push(`/login?redirect=/rate/${type}`)
      } else {
        router.push(`/rate/${type}`)
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mb-4">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">What would you like to rate?</h2>
            <p className="text-primary-100">Share your experience and help others make better decisions</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Neighborhood Option */}
            <button
              onClick={() => handleChoice('neighborhood')}
              className="group relative bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-primary-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Neighborhood</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Safety & Security</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Cleanliness & Upkeep</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-pink-600" />
                    <span>Community & Transit</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-primary-600 font-bold group-hover:text-primary-700">
                  <span>Rate a Neighborhood</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

            {/* Building Option */}
            <button
              onClick={() => handleChoice('building')}
              className="group relative bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-gray-400 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Apartment/Building</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Management & Staff</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Maintenance & Cleanliness</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span>Value & Amenities</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-gray-700 font-bold group-hover:text-gray-900">
                  <span>Rate a Building</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

