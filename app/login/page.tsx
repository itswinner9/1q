'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Star, AlertTriangle } from 'lucide-react'
import { supabase, supabaseConfigured } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [configError, setConfigError] = useState(false)

  useEffect(() => {
    // Check if Supabase is configured
    if (!supabaseConfigured) {
      setConfigError(true)
      console.error('❌ Supabase is NOT configured! Check .env.local and restart server.')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Check configuration first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Supabase is not configured. Make sure .env.local exists and restart the dev server.')
      return
    }

    setLoading(true)

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      setError('Login timeout. Server might not have loaded .env.local')
      setLoading(false)
    }, 5000)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      clearTimeout(timeout)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Success - redirect
      window.location.href = '/profile'
      
    } catch (error: any) {
      clearTimeout(timeout)
      setError(error.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Star className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Neighborhood<span className="text-primary-500">Rank</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {configError && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">⚠️ Configuration Error</h3>
                <p className="text-red-800 text-sm mb-3">
                  Supabase is not configured. Login will not work.
                </p>
                <div className="bg-red-100 rounded p-3 text-xs text-red-900 space-y-1">
                  <p><strong>Fix:</strong></p>
                  <p>1. Make sure .env.local exists</p>
                  <p>2. Restart dev server: <code className="bg-red-200 px-1 rounded">npm run dev</code></p>
                  <p>3. Refresh this page</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary-500 font-semibold hover:text-primary-600">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

