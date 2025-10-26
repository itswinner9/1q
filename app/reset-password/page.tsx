'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Star, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('❌ Password reset error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('✅ Password reset successful!')
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Exception:', error)
      setError('Password reset failed: ' + (error.message || 'Please try again'))
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been updated. Redirecting to your profile...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary-500 mx-auto"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter new password"
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Confirm new password"
                minLength={6}
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
                <span>Resetting Password...</span>
              </div>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-primary-500 font-medium hover:text-primary-600">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}


