'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, Users, Star, MapPin, Building2, Image as ImageIcon, 
  Settings, Home, LogOut, Menu, X, Clock, CheckCircle, AlertCircle 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    checkAdmin()
    fetchPendingCount()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session - redirect to login')
        setLoading(false)
        router.push('/login')
        return
      }

      console.log('Session found:', session.user.email)

      // Check admin status
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('is_admin, email')
        .eq('id', session.user.id)
        .maybeSingle()

      console.log('Profile check:', { profile, error })

      if (error) {
        console.error('Database error:', error)
        alert('❌ Database Error!\n\nRun CLEAN_DATABASE_SETUP.sql in Supabase to create user_profiles table.')
        setLoading(false)
        router.push('/')
        return
      }

      if (!profile) {
        console.error('No profile found for user')
        alert('❌ Profile Not Found!\n\nRun CLEAN_DATABASE_SETUP.sql in Supabase to sync users.')
        setLoading(false)
        router.push('/')
        return
      }

      if (!profile.is_admin) {
        console.error('User is not admin:', session.user.email)
        alert('❌ Access Denied!\n\nYou are not an admin.\n\nTo make yourself admin, run in Supabase:\nUPDATE user_profiles SET is_admin = true WHERE email = \'' + session.user.email + '\';')
        setLoading(false)
        router.push('/')
        return
      }

      console.log('✅ Admin verified!')
      setIsAdmin(true)
      setLoading(false)
    } catch (err) {
      console.error('Exception:', err)
      setLoading(false)
      router.push('/')
    }
  }

  const fetchPendingCount = async () => {
    const { data: nReviews } = await supabase
      .from('neighborhood_reviews')
      .select('id')
      .eq('status', 'pending')
    
    const { data: bReviews } = await supabase
      .from('building_reviews')
      .select('id')
      .eq('status', 'pending')

    setPendingCount((nReviews?.length || 0) + (bReviews?.length || 0))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div>
      </div>
    )
  }

  if (!isAdmin) return null

  const menuItems = [
    { href: '/admin', icon: Shield, label: 'Dashboard', badge: null },
    { href: '/admin/pending', icon: Clock, label: 'Pending Reviews', badge: pendingCount > 0 ? pendingCount : null },
    { href: '/admin/users', icon: Users, label: 'Users', badge: null },
    { href: '/admin/neighborhoods', icon: MapPin, label: 'Neighborhoods', badge: null },
    { href: '/admin/buildings', icon: Building2, label: 'Buildings', badge: null },
    { href: '/admin/settings', icon: Settings, label: 'Settings', badge: null },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen ? (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Admin Panel</div>
                    <div className="text-xs text-gray-500">NeighborhoodRank</div>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
            >
              <Home className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
              {sidebarOpen && <span className="font-medium">View Site</span>}
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
              {sidebarOpen && <span className="font-medium">Sign Out</span>}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center px-4 py-2 text-gray-400 hover:text-gray-600 transition-all"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

