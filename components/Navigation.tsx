'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Star, Compass, User, LogOut, MapPin, Building2, Menu, X, PlusCircle, Shield, UserCheck, Building } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showRateDropdown, setShowRateDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      
      // Check if admin
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
        
        console.log('Nav admin check:', { profile, error, email: session.user.email })
        setIsAdmin(profile?.role === 'admin')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
        
        console.log('Nav auth change admin check:', { profile, error })
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowMobileMenu(false)
    router.push('/')
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                Liv<span className="text-primary-500">Rank</span>
              </span>
              <span className="text-xs text-gray-500 hidden lg:block">Real Reviews, Real Tenants</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Rate Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowRateDropdown(!showRateDropdown)}
                    onBlur={() => setTimeout(() => setShowRateDropdown(false), 200)}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 hover:shadow-md flex items-center space-x-2 text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Rate Now</span>
                  </button>
                  
                  {showRateDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <Link
                        href="/rate/neighborhood"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors"
                        onClick={() => setShowRateDropdown(false)}
                      >
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Rate a Neighborhood</p>
                          <p className="text-xs text-gray-500">Share your experience</p>
                        </div>
                      </Link>
                      <Link
                        href="/rate/building"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors"
                        onClick={() => setShowRateDropdown(false)}
                      >
                        <Building2 className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Rate a Building</p>
                          <p className="text-xs text-gray-500">Review your apartment</p>
                        </div>
                      </Link>
                      <Link
                        href="/rate/landlord"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors"
                        onClick={() => setShowRateDropdown(false)}
                      >
                        <UserCheck className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Rate a Landlord</p>
                          <p className="text-xs text-gray-500">Review your landlord</p>
                        </div>
                      </Link>
                      <Link
                        href="/rate/rent-company"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors"
                        onClick={() => setShowRateDropdown(false)}
                      >
                        <Building className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Rate a Rent Company</p>
                          <p className="text-xs text-gray-500">Review rent companies</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    onBlur={() => setTimeout(() => setShowProfileDropdown(false), 200)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm">Account</span>
                  </button>
                  
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-900">My Profile</p>
                          <p className="text-xs text-gray-500">View your reviews</p>
                        </div>
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors bg-primary-50/50"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <Shield className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="font-semibold text-primary-900">Admin Panel</p>
                            <p className="text-xs text-primary-600">Manage site</p>
                          </div>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false)
                          handleSignOut()
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all text-sm"
                >
                  Login
                </Link>
                <Link href="/signup" className="bg-primary-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 hover:shadow-md text-sm">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${
                pathname === '/' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/explore"
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${
                pathname === '/explore' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              <Compass className="w-5 h-5" />
              <span>Explore</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${
                    pathname === '/profile' ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="w-5 h-5" />
                  <span>My Reviews</span>
                </Link>

                <div className="px-4 py-2">
                  <p className="text-xs text-gray-500 font-semibold mb-2">RATE NOW</p>
                  <Link
                    href="/rate/neighborhood"
                    className="flex items-center space-x-2 px-4 py-3 bg-primary-50 rounded-lg text-primary-600 mb-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Rate a Neighborhood</span>
                  </Link>
                  <Link
                    href="/rate/building"
                    className="flex items-center space-x-2 px-4 py-3 bg-primary-50 rounded-lg text-primary-600 mb-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Rate a Building</span>
                  </Link>
                  <Link
                    href="/rate/landlord"
                    className="flex items-center space-x-2 px-4 py-3 bg-primary-50 rounded-lg text-primary-600 mb-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>Rate a Landlord</span>
                  </Link>
                  <Link
                    href="/rate/rent-company"
                    className="flex items-center space-x-2 px-4 py-3 bg-primary-50 rounded-lg text-primary-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Building className="w-5 h-5" />
                    <span>Rate a Rent Company</span>
                  </Link>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}

            {!user && (
              <div className="px-4 py-2 space-y-2">
                <Link
                  href="/login"
                  className="block text-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block text-center btn-primary"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
