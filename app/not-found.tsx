import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The neighborhood or building might have moved!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <Link href="/explore" className="btn-secondary flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Explore Ratings</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

