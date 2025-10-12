'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function BannedPage() {
  const [banInfo, setBanInfo] = useState<{
    reason: string | null
    bannedAt: string | null
    email: string | null
  }>({
    reason: null,
    bannedAt: null,
    email: null
  })

  useEffect(() => {
    fetchBanInfo()
  }, [])

  const fetchBanInfo = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('ban_reason, banned_at, email')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setBanInfo({
          reason: profile.ban_reason,
          bannedAt: profile.banned_at,
          email: profile.email
        })
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Account Suspended</h1>
            <p className="text-red-100">Your account has been banned from NeighborhoodRank</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Ban Details */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6" />
                <span>Ban Information</span>
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Account:</p>
                  <p className="text-gray-700">{banInfo.email || 'Unknown'}</p>
                </div>

                {banInfo.reason && (
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Reason:</p>
                    <p className="text-gray-700 bg-white rounded-lg p-3 border border-red-200">
                      {banInfo.reason}
                    </p>
                  </div>
                )}

                {banInfo.bannedAt && (
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Banned On:</p>
                    <p className="text-gray-700">
                      {new Date(banInfo.bannedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* What This Means */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What This Means:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">×</span>
                  <span>You cannot submit new reviews or ratings</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">×</span>
                  <span>You cannot access your profile or user features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">×</span>
                  <span>You cannot interact with the platform</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">×</span>
                  <span>Your previous reviews may have been removed</span>
                </li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Think This Was a Mistake?</h3>
                  <p className="text-gray-700 mb-3">
                    If you believe your account was banned in error, you can contact our support team to appeal this decision.
                  </p>
                  <a 
                    href="mailto:support@neighborhoodrank.com?subject=Ban%20Appeal%20Request"
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact Support</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="text-center">
              <button
                onClick={handleSignOut}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            NeighborhoodRank maintains a safe and trustworthy platform for all users.
          </p>
        </div>
      </div>
    </div>
  )
}

