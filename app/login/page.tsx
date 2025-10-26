'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Star, AlertTriangle } from 'lucide-react'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import CanadianSkyscrapers from '@/components/CanadianSkyscrapers'

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
    setLoading(true)

    try {
      console.log('🔐 Starting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // ALWAYS reset loading, no matter what
      if (error) {
        console.error('❌ Login error:', error)
        setError(error.message || 'Invalid email or password')
        setLoading(false)
        return
      }

      if (!data.session) {
        console.error('❌ No session returned')
        setError('Login failed - please try again')
        setLoading(false)
        return
      }

      console.log('✅ Login successful! Redirecting...')
      
      // Keep loading true during redirect
      window.location.href = '/'
      
    } catch (error: any) {
      console.error('❌ Exception:', error)
      setError('Login failed: ' + (error.message || 'Please try again'))
      setLoading(false)
    }
  }

  return (
    <main className="h-screen flex overflow-hidden">
      <CanadianSkyscrapers
        title="CANADIAN CITIES"
        subtitle="Find Your Perfect Place"
        description="Discover the best neighborhoods and buildings with honest reviews from real residents who live there."
      >
        <div></div>
      </CanadianSkyscrapers>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Liv<span className="text-primary-500">Rank</span>
            </span>
          </Link>

          {configError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Configuration Error</h3>
                  <p className="text-red-700 text-sm">
                    Supabase is not configured. Please check your environment variables.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Enter your email and password to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

                 <div className="flex items-center justify-between">
                   <label className="flex items-center">
                     <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                     <span className="ml-2 text-sm text-gray-600">Remember me</span>
                   </label>
                   <Link href="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
                     Forgot Password?
                   </Link>
                 </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary-500 font-medium hover:text-primary-600">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

