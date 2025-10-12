'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react'

export default function TestDatabase() {
  const [status, setStatus] = useState<any>({
    connection: 'testing',
    neighborhoodsTable: 'testing',
    buildingsTable: 'testing',
    neighborhoodsCount: 0,
    buildingsCount: 0,
    storage: 'testing',
    errors: []
  })

  useEffect(() => {
    testEverything()
  }, [])

  const testEverything = async () => {
    const errors: string[] = []
    const newStatus: any = { ...status }

    try {
      // Test 1: Connection
      try {
        const { error } = await supabase.from('neighborhoods').select('count').limit(1)
        newStatus.connection = error ? 'error' : 'success'
        if (error) errors.push(`Connection: ${error.message}`)
      } catch (e: any) {
        newStatus.connection = 'error'
        errors.push(`Connection: ${e.message}`)
      }

      // Test 2: Neighborhoods table
      try {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('*')
        
        if (error) {
          newStatus.neighborhoodsTable = 'error'
          errors.push(`Neighborhoods table: ${error.message}`)
        } else {
          newStatus.neighborhoodsTable = 'success'
          newStatus.neighborhoodsCount = data?.length || 0
        }
      } catch (e: any) {
        newStatus.neighborhoodsTable = 'error'
        errors.push(`Neighborhoods: ${e.message}`)
      }

      // Test 3: Buildings table
      try {
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
        
        if (error) {
          newStatus.buildingsTable = 'error'
          errors.push(`Buildings table: ${error.message}`)
        } else {
          newStatus.buildingsTable = 'success'
          newStatus.buildingsCount = data?.length || 0
        }
      } catch (e: any) {
        newStatus.buildingsTable = 'error'
        errors.push(`Buildings: ${e.message}`)
      }

      // Test 4: Storage buckets
      try {
        const { data, error } = await supabase.storage.listBuckets()
        
        if (error) {
          newStatus.storage = 'error'
          errors.push(`Storage: ${error.message}`)
        } else {
          const hasNeighborhood = data?.some(b => b.name === 'neighborhood-images')
          const hasBuilding = data?.some(b => b.name === 'building-images')
          newStatus.storage = hasNeighborhood && hasBuilding ? 'success' : 'warning'
          if (!hasNeighborhood) errors.push('Missing neighborhood-images bucket')
          if (!hasBuilding) errors.push('Missing building-images bucket')
        }
      } catch (e: any) {
        newStatus.storage = 'error'
        errors.push(`Storage: ${e.message}`)
      }

      newStatus.errors = errors
      setStatus(newStatus)
    } catch (error: any) {
      console.error('Test error:', error)
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'success') return <CheckCircle className="w-6 h-6 text-green-500" />
    if (status === 'error') return <XCircle className="w-6 h-6 text-red-500" />
    if (status === 'warning') return <AlertCircle className="w-6 h-6 text-yellow-500" />
    return <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <Database className="w-10 h-10 text-primary-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Database Connection Test</h1>
              <p className="text-gray-600">Testing your Supabase configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Connection Test */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <StatusIcon status={status.connection} />
                <div>
                  <p className="font-semibold text-gray-900">Supabase Connection</p>
                  <p className="text-sm text-gray-600">Testing database connectivity</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status.connection === 'success' ? 'bg-green-100 text-green-700' :
                status.connection === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {status.connection}
              </span>
            </div>

            {/* Neighborhoods Table */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <StatusIcon status={status.neighborhoodsTable} />
                <div>
                  <p className="font-semibold text-gray-900">Neighborhoods Table</p>
                  <p className="text-sm text-gray-600">
                    {status.neighborhoodsCount} neighborhoods found
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status.neighborhoodsTable === 'success' ? 'bg-green-100 text-green-700' :
                status.neighborhoodsTable === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {status.neighborhoodsTable}
              </span>
            </div>

            {/* Buildings Table */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <StatusIcon status={status.buildingsTable} />
                <div>
                  <p className="font-semibold text-gray-900">Buildings Table</p>
                  <p className="text-sm text-gray-600">
                    {status.buildingsCount} buildings found
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status.buildingsTable === 'success' ? 'bg-green-100 text-green-700' :
                status.buildingsTable === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {status.buildingsTable}
              </span>
            </div>

            {/* Storage Test */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <StatusIcon status={status.storage} />
                <div>
                  <p className="font-semibold text-gray-900">Storage Buckets</p>
                  <p className="text-sm text-gray-600">
                    Image storage configuration
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status.storage === 'success' ? 'bg-green-100 text-green-700' :
                status.storage === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                status.storage === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {status.storage}
              </span>
            </div>
          </div>

          {/* Errors */}
          {status.errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="font-semibold text-red-900 mb-2">Issues Found:</h3>
              <ul className="space-y-1">
                {status.errors.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {status.connection === 'success' && status.neighborhoodsTable === 'success' && status.buildingsTable === 'success' && (
            <div className="mt-6 p-6 bg-green-50 border-2 border-green-500 rounded-xl">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-900 text-lg mb-2">✅ Everything Working!</h3>
                  <p className="text-green-700 mb-3">
                    Your database is connected and has {status.neighborhoodsCount} neighborhoods and {status.buildingsCount} buildings.
                  </p>
                  <div className="flex space-x-3">
                    <a href="/" className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-block">
                      View Homepage
                    </a>
                    <a href="/explore" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-block">
                      View Explore
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions if Empty */}
          {status.neighborhoodsCount === 0 && status.buildingsCount === 0 && status.connection === 'success' && (
            <div className="mt-6 p-6 bg-yellow-50 border-2 border-yellow-500 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900 text-lg mb-2">⚠️ Database is Empty</h3>
                  <p className="text-yellow-700 mb-3">
                    Your tables exist but have no data. You can:
                  </p>
                  <ul className="space-y-2 text-yellow-700 mb-4">
                    <li>1. Add test data using the SQL in DATABASE_CHECK.md (Step 3)</li>
                    <li>2. Rate a neighborhood/building manually to add real data</li>
                  </ul>
                  <a href="/rate" className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-block">
                    Rate Now
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={testEverything}
              className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition-colors"
            >
              Re-run Tests
            </button>
            <a
              href="/"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        </div>

        {/* Quick Fix Guide */}
        <div className="mt-8 bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Fix Guide</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Step 1: Create Tables</h3>
              <p className="text-sm text-blue-700">
                Go to Supabase → SQL Editor → Run the SQL from SUPABASE_SETUP.md
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <h3 className="font-semibold text-purple-900 mb-2">📊 Step 2: Add Test Data</h3>
              <p className="text-sm text-purple-700">
                Run the test data SQL from DATABASE_CHECK.md to see sample ratings
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">📸 Step 3: Set Up Storage</h3>
              <p className="text-sm text-green-700">
                Create neighborhood-images and building-images buckets (both PUBLIC)
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl">
              <h3 className="font-semibold text-orange-900 mb-2">🧪 Step 4: Test!</h3>
              <p className="text-sm text-orange-700">
                Click "Re-run Tests" above to verify everything works
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

