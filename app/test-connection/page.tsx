'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function TestConnection() {
  const [results, setResults] = useState<any>({})
  const [testing, setTesting] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const tests: any = {}

    // Test 1: Environment variables
    tests.envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'
    tests.envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
    tests.urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'

    // Test 2: Supabase client created
    tests.clientCreated = supabase ? '✅ Yes' : '❌ No'

    // Test 3: Can connect to Supabase
    try {
      const start = Date.now()
      const { data, error } = await supabase.auth.getSession()
      const elapsed = Date.now() - start
      
      tests.connectionTime = `${elapsed}ms`
      tests.connectionStatus = error ? `❌ Error: ${error.message}` : '✅ Success'
      tests.hasSession = data.session ? '✅ Yes (logged in)' : 'No (not logged in)'
    } catch (err: any) {
      tests.connectionStatus = `❌ Exception: ${err.message}`
    }

    // Test 4: Can query user_profiles table
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)
      
      tests.userProfilesTable = error 
        ? `❌ Error: ${error.message}` 
        : '✅ Table exists'
    } catch (err: any) {
      tests.userProfilesTable = `❌ Exception: ${err.message}`
    }

    // Test 5: Can query neighborhoods table
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('count')
        .limit(1)
      
      tests.neighborhoodsTable = error 
        ? `❌ Error: ${error.message}` 
        : '✅ Table exists'
    } catch (err: any) {
      tests.neighborhoodsTable = `❌ Exception: ${err.message}`
    }

    setResults(tests)
    setTesting(false)
  }

  if (testing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500 mb-4"></div>
          <p className="text-gray-600">Testing Supabase connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Supabase Connection Test</h1>

          <div className="space-y-4">
            {/* Environment Variables */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h2 className="font-bold text-lg mb-3">1. Environment Variables</h2>
              <div className="space-y-2 text-sm">
                <p><strong>SUPABASE_URL:</strong> {results.envUrl}</p>
                <p className="text-xs text-gray-600">{results.urlValue}</p>
                <p><strong>SUPABASE_ANON_KEY:</strong> {results.envKey}</p>
              </div>
            </div>

            {/* Supabase Client */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h2 className="font-bold text-lg mb-3">2. Supabase Client</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Client Created:</strong> {results.clientCreated}</p>
              </div>
            </div>

            {/* Connection Test */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h2 className="font-bold text-lg mb-3">3. Connection Test</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> {results.connectionStatus}</p>
                <p><strong>Response Time:</strong> {results.connectionTime}</p>
                <p><strong>Has Session:</strong> {results.hasSession}</p>
              </div>
            </div>

            {/* Database Tables */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h2 className="font-bold text-lg mb-3">4. Database Tables</h2>
              <div className="space-y-2 text-sm">
                <p><strong>user_profiles:</strong> {results.userProfilesTable}</p>
                <p><strong>neighborhoods:</strong> {results.neighborhoodsTable}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
              <h2 className="font-bold text-lg mb-3 text-blue-900">💡 Recommendations:</h2>
              <div className="space-y-2 text-sm text-blue-800">
                {results.envUrl === '❌ Missing' && (
                  <p>❌ Create .env.local file with Supabase credentials</p>
                )}
                {results.envKey === '❌ Missing' && (
                  <p>❌ Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local</p>
                )}
                {results.connectionStatus?.includes('❌') && (
                  <p>❌ Restart your dev server to load .env.local</p>
                )}
                {results.userProfilesTable?.includes('❌') && (
                  <p>❌ Run FIX_EVERYTHING_NOW.sql in Supabase to create tables</p>
                )}
                {!results.connectionStatus?.includes('❌') && 
                 !results.userProfilesTable?.includes('❌') && (
                  <p>✅ Everything looks good! Login should work.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button onClick={runTests} className="btn-primary">
              Run Tests Again
            </button>
            <a href="/" className="btn-secondary">
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

