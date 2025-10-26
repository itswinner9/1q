'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Error Details
                </summary>
                <code className="text-xs text-red-600 block">
                  {this.state.error.toString()}
                </code>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
              <Link href="/" className="btn-secondary">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


