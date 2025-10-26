'use client'

import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import Link from 'next/link'

export default function TestPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [details, setDetails] = useState<any>({})

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check if environment variables are loaded
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        console.log('Testing Supabase connection...')
        console.log('URL:', url ? '✅' : '❌')
        console.log('Key:', key ? '✅' : '❌')
        console.log('Configured:', supabaseConfigured ? '✅' : '❌')

        setDetails({
          envUrl: url ? '✅ Set' : '❌ Missing',
          envKey: key ? '✅ Set' : '❌ Missing',
          configured: supabaseConfigured ? '✅ Yes' : '❌ No',
        })

        if (!supabaseConfigured) {
          setStatus('error')
          return
        }

        // Try to connect to Supabase
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1)

        if (error) {
          console.error('Database query error:', error)
          setDetails(prev => ({
            ...prev,
            dbError: error.message,
            dbConnection: '❌ Failed'
          }))
          setStatus('error')
        } else {
          console.log('✅ Database connection successful!')
          setDetails(prev => ({
            ...prev,
            dbConnection: '✅ Connected'
          }))
          setStatus('success')
        }
      } catch (err: any) {
        console.error('Test error:', err)
        setDetails(prev => ({
          ...prev,
          exception: err.message
        }))
        setStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 System Test</h1>

          {status === 'checking' && (
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Testing connection...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                <h2 className="text-xl font-bold text-green-900 mb-2">✅ All Systems Go!</h2>
                <p className="text-green-700">Your app is properly configured and connected.</p>
              </div>

              <div className="space-y-2">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">{key}:</span>
                    <span className="text-gray-900">{value as string}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Link href="/login" className="btn-primary">
                  Try Login
                </Link>
                <Link href="/signup" className="btn-secondary">
                  Try Signup
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4">
                <h2 className="text-xl font-bold text-red-900 mb-2">❌ Configuration Error</h2>
                <p className="text-red-700 mb-4">There's an issue with your setup.</p>
              </div>

              <div className="space-y-2">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">{key}:</span>
                    <span className="text-gray-900">{value as string}</span>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mt-4">
                <h3 className="font-bold text-yellow-900 mb-2">🔧 How to Fix:</h3>
                <ol className="text-yellow-800 text-sm space-y-2 list-decimal list-inside">
                  <li>Check that <code className="bg-yellow-100 px-1 rounded">.env.local</code> exists in project root</li>
                  <li>Verify it has valid Supabase credentials</li>
                  <li>Kill the dev server (Ctrl+C)</li>
                  <li>Restart: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
                  <li>Hard refresh browser: <code className="bg-yellow-100 px-1 rounded">Cmd+Shift+R</code></li>
                  <li>Run <code className="bg-yellow-100 px-1 rounded">DATABASE_FINAL.sql</code> in Supabase</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
