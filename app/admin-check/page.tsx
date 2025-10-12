'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminCheck() {
  const [status, setStatus] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkEverything()
  }, [])

  const checkEverything = async () => {
    const results: any = {}

    // 1. Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()
    results.loggedIn = !!session
    results.userEmail = session?.user?.email || 'Not logged in'
    results.userId = session?.user?.id || 'N/A'

    if (session) {
      // 2. Check if user_profiles table exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      results.profileExists = !!profile
      results.profileError = profileError?.message || null
      results.isAdmin = profile?.is_admin || false
      results.isBanned = profile?.is_banned || false
      results.profile = profile

      // 3. Check if tables exist
      const { error: nError } = await supabase.from('neighborhoods').select('id').limit(1)
      const { error: bError } = await supabase.from('buildings').select('id').limit(1)
      const { error: nrError } = await supabase.from('neighborhood_reviews').select('id').limit(1)
      const { error: brError } = await supabase.from('building_reviews').select('id').limit(1)

      results.tables = {
        neighborhoods: !nError,
        buildings: !bError,
        neighborhood_reviews: !nrError,
        building_reviews: !brError
      }
    }

    setStatus(results)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500 mb-4"></div>
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Admin Access Diagnostic</h1>

          {/* Login Status */}
          <div className="mb-6 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-bold mb-4">1. Login Status</h2>
            <div className="space-y-2">
              <p>
                <strong>Logged In:</strong>{' '}
                <span className={status.loggedIn ? 'text-green-600' : 'text-red-600'}>
                  {status.loggedIn ? '✅ Yes' : '❌ No'}
                </span>
              </p>
              <p><strong>Email:</strong> {status.userEmail}</p>
              <p className="text-xs text-gray-600"><strong>User ID:</strong> {status.userId}</p>
            </div>
          </div>

          {/* Profile Status */}
          {status.loggedIn && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl">
              <h2 className="text-xl font-bold mb-4">2. User Profile</h2>
              <div className="space-y-2">
                <p>
                  <strong>Profile Exists:</strong>{' '}
                  <span className={status.profileExists ? 'text-green-600' : 'text-red-600'}>
                    {status.profileExists ? '✅ Yes' : '❌ No'}
                  </span>
                </p>
                {status.profileError && (
                  <p className="text-red-600 text-sm">
                    <strong>Error:</strong> {status.profileError}
                  </p>
                )}
                <p>
                  <strong>Is Admin:</strong>{' '}
                  <span className={status.isAdmin ? 'text-green-600' : 'text-red-600'}>
                    {status.isAdmin ? '✅ Yes' : '❌ No'}
                  </span>
                </p>
                <p>
                  <strong>Is Banned:</strong>{' '}
                  <span className={status.isBanned ? 'text-red-600' : 'text-green-600'}>
                    {status.isBanned ? '❌ Yes' : '✅ No'}
                  </span>
                </p>
                {status.profile && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600">Show full profile data</summary>
                    <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(status.profile, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Tables Status */}
          {status.tables && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl">
              <h2 className="text-xl font-bold mb-4">3. Database Tables</h2>
              <div className="space-y-2">
                {Object.entries(status.tables).map(([table, exists]: any) => (
                  <p key={table}>
                    <strong>{table}:</strong>{' '}
                    <span className={exists ? 'text-green-600' : 'text-red-600'}>
                      {exists ? '✅ Exists' : '❌ Missing'}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-900">💡 What To Do:</h2>
            <div className="space-y-3">
              {!status.loggedIn && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-red-600 mb-2">❌ You are not logged in</p>
                  <p className="text-sm text-gray-700 mb-2">Action: Sign in first</p>
                  <Link href="/login" className="text-primary-600 hover:underline">
                    Go to Login →
                  </Link>
                </div>
              )}

              {status.loggedIn && !status.profileExists && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-red-600 mb-2">❌ User profile not found</p>
                  <p className="text-sm text-gray-700 mb-2">Action: Run FIX_EVERYTHING_NOW.sql in Supabase</p>
                  <p className="text-xs text-gray-600">This will create user_profiles table and sync all users</p>
                </div>
              )}

              {status.loggedIn && status.profileExists && !status.isAdmin && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-red-600 mb-2">❌ You are not an admin</p>
                  <p className="text-sm text-gray-700 mb-2">Action: Run this SQL in Supabase:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-2">
                    {`UPDATE user_profiles SET is_admin = true WHERE email = '${status.userEmail}';`}
                  </pre>
                </div>
              )}

              {status.loggedIn && status.profileExists && status.isAdmin && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-green-600 mb-2">✅ Everything looks good!</p>
                  <p className="text-sm text-gray-700 mb-2">You should be able to access the admin panel</p>
                  <Link href="/admin" className="text-primary-600 hover:underline">
                    Go to Admin Panel →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <Link href="/" className="btn-secondary">
              Go Home
            </Link>
            <button onClick={checkEverything} className="btn-primary">
              Recheck Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

