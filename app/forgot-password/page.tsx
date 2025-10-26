'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Star, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('❌ Reset email error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('✅ Reset email sent!')
      setSuccess(true)
      setLoading(false)
      
    } catch (error: any) {
      console.error('❌ Exception:', error)
      setError('Failed to send reset email: ' + (error.message || 'Please try again'))
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email!</h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a password reset link to:
          </p>
          <p className="text-lg font-semibold text-primary-500 mb-8">{email}</p>
          <p className="text-sm text-gray-500 mb-8">
            Click the link in the email to reset your password. The link expires in 1 hour.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-all font-semibold"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Neighborhood<span className="text-primary-500">Rank</span>
          </span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <form onSubmit={handleSendReset} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending Reset Link...</span>
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-primary-500 font-medium hover:text-primary-600 flex items-center justify-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

