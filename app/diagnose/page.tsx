'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DiagnosePage() {
  const [status, setStatus] = useState<any>({
    checking: true,
    supabaseConnection: 'checking',
    userProfilesTable: 'checking',
    authUsers: 'checking',
    canLogin: 'checking',
    errors: []
  })

  useEffect(() => {
    const runDiagnostics = async () => {
      const errors: string[] = []
      const newStatus: any = { checking: false, errors }

      // Test 1: Supabase Connection
      console.log('🔍 Test 1: Supabase Connection...')
      try {
        const { data, error } = await Promise.race([
          supabase.from('user_profiles').select('count').limit(1),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]) as any

        if (error) {
          if (error.message.includes('relation "user_profiles" does not exist')) {
            newStatus.userProfilesTable = '❌ Table does not exist'
            errors.push('user_profiles table not created - Run DATABASE_COMPLETE_WORKING.sql')
          } else if (error.message === 'Timeout') {
            newStatus.supabaseConnection = '❌ Connection timeout'
            errors.push('Supabase connection timeout - Check project status')
          } else {
            newStatus.userProfilesTable = '❌ Error: ' + error.message
            errors.push('Database error: ' + error.message)
          }
        } else {
          newStatus.supabaseConnection = '✅ Connected'
          newStatus.userProfilesTable = '✅ Table exists'
        }
      } catch (err: any) {
        if (err.message === 'Timeout') {
          newStatus.supabaseConnection = '❌ Connection timeout'
          errors.push('Connection to Supabase timed out after 5 seconds')
        } else {
          newStatus.supabaseConnection = '❌ Failed'
          errors.push('Connection error: ' + err.message)
        }
      }

      // Test 2: Check auth.users
      console.log('🔍 Test 2: Auth Users...')
      try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers()
        if (error) {
          newStatus.authUsers = '⚠️ Cannot access (normal)'
          console.log('Auth users not accessible (this is normal for anon key)')
        } else {
          newStatus.authUsers = `✅ ${users?.length || 0} users`
        }
      } catch (err: any) {
        newStatus.authUsers = '⚠️ Cannot check'
      }

      // Test 3: Try a test login
      console.log('🔍 Test 3: Login Capability...')
      try {
        // Just check if the auth endpoint responds
        const { data, error } = await Promise.race([
          supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: 'wrongpassword'
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]) as any

        if (error) {
          if (error.message === 'Timeout') {
            newStatus.canLogin = '❌ Login endpoint timeout'
            errors.push('Auth login endpoint not responding')
          } else if (error.message.includes('Invalid login')) {
            newStatus.canLogin = '✅ Login endpoint working'
          } else {
            newStatus.canLogin = '⚠️ ' + error.message
          }
        } else {
          newStatus.canLogin = '✅ Working'
        }
      } catch (err: any) {
        if (err.message === 'Timeout') {
          newStatus.canLogin = '❌ Login timeout'
          errors.push('Auth system not responding')
        } else {
          newStatus.canLogin = '❌ Error'
          errors.push('Auth error: ' + err.message)
        }
      }

      setStatus(newStatus)
      console.log('📊 Diagnostic Results:', newStatus)
    }

    runDiagnostics()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 System Diagnostics</h1>
          <p className="text-gray-600 mb-8">Testing your app configuration...</p>

          {status.checking ? (
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Running diagnostics...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Supabase Connection</h3>
                  <p className="text-lg">{status.supabaseConnection}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">User Profiles Table</h3>
                  <p className="text-lg">{status.userProfilesTable}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Auth Users</h3>
                  <p className="text-lg">{status.authUsers}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Login Capability</h3>
                  <p className="text-lg">{status.canLogin}</p>
                </div>
              </div>

              {/* Errors */}
              {status.errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-red-900 mb-4">❌ Issues Found:</h2>
                  <ul className="space-y-2">
                    {status.errors.map((error: string, i: number) => (
                      <li key={i} className="text-red-800 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 bg-red-100 rounded-lg p-4">
                    <h3 className="font-bold text-red-900 mb-2">🔧 How to Fix:</h3>
                    <ol className="text-red-800 text-sm space-y-2 list-decimal list-inside">
                      <li>Open <strong>Supabase Dashboard</strong></li>
                      <li>Go to <strong>SQL Editor</strong></li>
                      <li>Copy ALL of <code className="bg-red-200 px-1 rounded">DATABASE_COMPLETE_WORKING.sql</code></li>
                      <li>Paste and click <strong>RUN</strong></li>
                      <li>Wait for success message</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Success */}
              {status.errors.length === 0 && (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-green-900 mb-2">✅ All Systems Working!</h2>
                  <p className="text-green-700 mb-4">Your app is properly configured.</p>
                  
                  <div className="flex gap-3">
                    <Link href="/signup" className="btn-primary">
                      Try Signup
                    </Link>
                    <Link href="/login" className="btn-secondary">
                      Try Login
                    </Link>
                  </div>
                </div>
              )}

              {/* Environment Info */}
              <div className="bg-blue-50 border border-blue-300 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-2">📋 Environment Info:</h3>
                <div className="text-blue-800 text-sm space-y-1 font-mono">
                  <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
                  <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

