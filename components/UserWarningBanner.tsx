'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserWarningBannerProps {
  userId?: string
}

export default function UserWarningBanner({ userId }: UserWarningBannerProps) {
  const [userStatus, setUserStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    checkUserStatus()
  }, [userId])

  const checkUserStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('is_banned, ban_reason, banned_at')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error checking user status:', error)
        setLoading(false)
        return
      }

      setUserStatus(profile)
    } catch (error) {
      console.error('Error in checkUserStatus:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !userStatus?.is_banned || !showBanner) {
    return null
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Account Suspended
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-2">
              Your account has been suspended and you cannot access most features of this platform.
            </p>
            {userStatus.ban_reason && (
              <div className="mb-2">
                <strong>Reason:</strong> {userStatus.ban_reason}
              </div>
            )}
            {userStatus.banned_at && (
              <div className="mb-2 text-xs">
                <strong>Suspended on:</strong> {new Date(userStatus.banned_at).toLocaleDateString()}
              </div>
            )}
            <div className="mt-3">
              <p className="text-sm">
                <strong>What you cannot do:</strong>
              </p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                <li>Submit new reviews</li>
                <li>Edit existing reviews</li>
                <li>Upload photos</li>
                <li>Access your profile</li>
                <li>Use most platform features</li>
              </ul>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">
                <strong>Appeal Process:</strong>
              </p>
              <p className="text-xs mt-1">
                If you believe this suspension is in error, you can appeal by contacting our support team.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-red-600" />
                <span className="text-xs text-red-700">support@neighborhoodrank.com</span>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setShowBanner(false)}
              className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
