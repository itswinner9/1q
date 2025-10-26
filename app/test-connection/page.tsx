'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Database, Users, Building2, MapPin } from 'lucide-react'

export default function TestConnection() {
  const [results, setResults] = useState<any>({
    connection: { status: 'testing', message: 'Testing...' },
    auth: { status: 'testing', message: 'Testing...' },
    tables: { status: 'testing', message: 'Testing...', details: {} },
    user: null,
  })

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const newResults: any = {
      connection: { status: 'testing', message: 'Testing...' },
      auth: { status: 'testing', message: 'Testing...' },
      tables: { status: 'testing', message: 'Testing...', details: {} },
      user: null,
    }

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from('neighborhoods').select('count')
      
      if (error) {
        newResults.connection = {
          status: 'error',
          message: `Connection failed: ${error.message}`,
        }
      } else {
        newResults.connection = {
          status: 'success',
          message: 'Database connected successfully!',
        }
      }
    } catch (error: any) {
      newResults.connection = {
        status: 'error',
        message: `Connection error: ${error.message}`,
      }
    }

    // Test 2: Check Current User
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        newResults.auth = {
          status: 'success',
          message: `Logged in as: ${session.user.email}`,
        }
        newResults.user = session.user
      } else {
        newResults.auth = {
          status: 'warning',
          message: 'No user logged in (this is okay for testing)',
        }
      }
    } catch (error: any) {
      newResults.auth = {
        status: 'error',
        message: `Auth error: ${error.message}`,
      }
    }

    // Test 3: Check Tables Exist
    const tablesToCheck = [
      'user_profiles',
      'neighborhoods',
      'buildings',
      'neighborhood_reviews',
      'building_reviews',
      'review_votes',
    ]

    const tableResults: any = {}
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        
        if (error) {
          tableResults[table] = { exists: false, error: error.message }
        } else {
          // Get actual count
          const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
          tableResults[table] = { exists: true, count: count || 0 }
        }
      } catch (error: any) {
        tableResults[table] = { exists: false, error: error.message }
      }
    }

    const allTablesExist = Object.values(tableResults).every((r: any) => r.exists)
    
    newResults.tables = {
      status: allTablesExist ? 'success' : 'error',
      message: allTablesExist 
        ? 'All required tables exist!' 
        : 'Some tables are missing - run LIVRANK_COMPLETE_DB.sql',
      details: tableResults,
    }

    setResults(newResults)
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'success') return <CheckCircle className="w-6 h-6 text-green-500" />
    if (status === 'error') return <XCircle className="w-6 h-6 text-red-500" />
    if (status === 'warning') return <CheckCircle className="w-6 h-6 text-yellow-500" />
    return <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <Database className="w-10 h-10 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LivRank System Test</h1>
              <p className="text-gray-600">Database & Authentication Verification</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Test 1: Connection */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <StatusIcon status={results.connection.status} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Database Connection</h3>
                  <p className={`text-sm ${
                    results.connection.status === 'success' ? 'text-green-600' :
                    results.connection.status === 'error' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {results.connection.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Test 2: Auth */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <StatusIcon status={results.auth.status} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Authentication Status</h3>
                  <p className={`text-sm ${
                    results.auth.status === 'success' ? 'text-green-600' :
                    results.auth.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {results.auth.message}
                  </p>
                  {results.user && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                      <p><strong>User ID:</strong> {results.user.id}</p>
                      <p><strong>Email:</strong> {results.user.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test 3: Tables */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <StatusIcon status={results.tables.status} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Database Tables</h3>
                  <p className={`text-sm mb-4 ${
                    results.tables.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {results.tables.message}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(results.tables.details).map(([table, info]: [string, any]) => (
                      <div key={table} className={`p-3 rounded-lg border ${
                        info.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">{table}</span>
                          {info.exists ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        {info.exists && (
                          <p className="text-xs text-gray-600 mt-1">{info.count} rows</p>
                        )}
                        {!info.exists && info.error && (
                          <p className="text-xs text-red-600 mt-1">{info.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/signup"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Test Signup</span>
            </a>
            
            <a
              href="/rate/building"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Building2 className="w-5 h-5" />
              <span>Rate Building</span>
            </a>
            
            <a
              href="/rate/neighborhood"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span>Rate Neighborhood</span>
            </a>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> If tables are missing, go to your Supabase dashboard 
              and run the <code className="px-2 py-1 bg-white rounded">LIVRANK_COMPLETE_DB.sql</code> file.
            </p>
            <a 
              href="https://supabase.com/dashboard/project/eehtzdpzbjsuendgwnwy/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold underline mt-2 inline-block"
            >
              Open Supabase SQL Editor →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
