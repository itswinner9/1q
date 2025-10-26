import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if variables are set
const isConfigured = supabaseUrl && supabaseAnonKey

// Log configuration status (client-side only)
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? '✅ Set' : '❌ Missing',
    key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
  })
  
  if (!isConfigured) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ SUPABASE NOT CONFIGURED!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('1. Check if .env.local exists in project root')
    console.error('2. Restart dev server: npm run dev')
    console.error('3. Hard refresh browser: Ctrl+Shift+R')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}

// Create Supabase client (will fail gracefully if not configured)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Export configuration status for UI checks
export const supabaseConfigured = isConfigured

export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface Neighborhood {
  id: string
  name: string
  city: string
  province: string
  slug?: string
  cover_image?: string
  user_id?: string
  safety?: number
  cleanliness?: number
  noise?: number
  community?: number
  transit?: number
  amenities?: number
  average_rating: number
  images?: string[]
  total_ratings?: number
  total_reviews?: number
  latitude?: number
  longitude?: number
  created_at: string
  updated_at?: string
  user?: User
}

export interface Building {
  id: string
  name: string
  address: string
  city: string
  province: string
  slug?: string
  cover_image?: string
  user_id?: string
  management?: number
  cleanliness?: number
  maintenance?: number
  rent_value?: number
  noise?: number
  amenities?: number
  average_rating: number
  images?: string[]
  total_ratings?: number
  total_reviews?: number
  latitude?: number
  longitude?: number
  created_at: string
  updated_at?: string
  user?: User
}

export interface NeighborhoodReview {
  id: string
  neighborhood_id: string
  user_id: string
  safety: number
  cleanliness: number
  noise: number
  community: number
  transit: number
  amenities: number
  comment?: string
  images: string[]
  is_anonymous?: boolean
  display_name?: string
  status?: string
  helpful_count?: number
  not_helpful_count?: number
  created_at: string
  updated_at: string
  user?: User
}

export interface BuildingReview {
  id: string
  building_id: string
  user_id: string
  management: number
  cleanliness: number
  maintenance: number
  rent_value: number
  noise: number
  amenities: number
  comment?: string
  images: string[]
  is_anonymous?: boolean
  display_name?: string
  status?: string
  helpful_count?: number
  not_helpful_count?: number
  created_at: string
  updated_at: string
  user?: User
}

