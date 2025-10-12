'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function TestPage() {
  const [results, setResults] = useState<any>({})
  const [testing, setTesting] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setTesting(true)
    const testResults: any = {}

    // Test 1: Environment Variables
    testResults.envUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    testResults.envKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    testResults.configured = supabaseConfigured

    console.log('Environment Check:', {
      url: testResults.envUrl ? 'Set' : 'Missing',
      key: testResults.envKey ? 'Set' : 'Missing',
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    // Test 2: Supabase Connection
    if (supabaseConfigured) {
      try {
        const start = Date.now()
        const { data, error } = await supabase.auth.getSession()
        const elapsed = Date.now() - start
        
        testResults.connectionTime = `${elapsed}ms`
        testResults.connectionWorks = !error
        testResults.connectionError = error?.message || null
      } catch (err: any) {
        testResults.connectionWorks = false
        testResults.connectionError = err.message
      }

      // Test 3: Database Query
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1)
        
        testResults.dbWorks = !error
        testResults.dbError = error?.message || null
      } catch (err: any) {
        testResults.dbWorks = false
        testResults.dbError = err.message
      }
    }

    setResults(testResults)
    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Supabase Connection Test</h1>

          <div className="space-y-4">
            {/* Test 1: Environment Variables */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <h2 className="font-bold text-lg mb-4">1. Environment Variables</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_URL</span>
                  {results.envUrl ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  {results.envKey ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Test 2: Supabase Connection */}
            {results.configured && (
              <div className="p-6 bg-gray-50 rounded-xl">
                <h2 className="font-bold text-lg mb-4">2. Supabase Connection</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Connection Status</span>
                    {results.connectionWorks ? (
                      <span className="text-green-600 font-semibold">✅ Connected</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Failed</span>
                    )}
                  </div>
                  {results.connectionTime && (
                    <div className="text-sm text-gray-600">
                      Response time: {results.connectionTime}
                    </div>
                  )}
                  {results.connectionError && (
                    <div className="text-sm text-red-600">
                      Error: {results.connectionError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Test 3: Database Query */}
            {results.configured && (
              <div className="p-6 bg-gray-50 rounded-xl">
                <h2 className="font-bold text-lg mb-4">3. Database Access</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">user_profiles table</span>
                    {results.dbWorks ? (
                      <span className="text-green-600 font-semibold">✅ Accessible</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Not found</span>
                    )}
                  </div>
                  {results.dbError && (
                    <div className="text-sm text-red-600">
                      Error: {results.dbError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className={`p-6 rounded-xl border-2 ${
              results.envUrl && results.envKey && results.connectionWorks && results.dbWorks
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <h2 className="font-bold text-lg mb-4">
                {results.envUrl && results.envKey && results.connectionWorks && results.dbWorks
                  ? '✅ Everything Works!'
                  : '❌ Action Required'}
              </h2>
              <div className="space-y-2 text-sm">
                {!results.envUrl || !results.envKey ? (
                  <>
                    <p className="text-red-800 font-semibold">Environment variables missing!</p>
                    <p className="text-red-700">1. Check .env.local exists in project root</p>
                    <p className="text-red-700">2. Restart dev server: <code className="bg-red-100 px-1 rounded">npm run dev</code></p>
                    <p className="text-red-700">3. Hard refresh browser: Ctrl+Shift+R</p>
                  </>
                ) : !results.connectionWorks ? (
                  <>
                    <p className="text-red-800 font-semibold">Can&apos;t connect to Supabase!</p>
                    <p className="text-red-700">Check Supabase project is online</p>
                    <p className="text-red-700">Verify URL and key are correct</p>
                  </>
                ) : !results.dbWorks ? (
                  <>
                    <p className="text-red-800 font-semibold">Database tables missing!</p>
                    <p className="text-red-700">Run ULTIMATE_FIX.sql in Supabase SQL Editor</p>
                  </>
                ) : (
                  <>
                    <p className="text-green-800 font-semibold">All systems operational! ✨</p>
                    <p className="text-green-700">You can now use login, profile, and admin features</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button 
              onClick={runTests} 
              disabled={testing}
              className="btn-primary disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Run Tests Again'}</span>
            </button>
            <Link href="/login" className="btn-secondary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

