// Clean Supabase client with proper error handling
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check configuration
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('❌ Supabase not configured!')
    console.error('Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper to check if configured
export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Type definitions
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  is_banned: boolean
  ban_reason: string | null
  banned_at: string | null
  created_at: string
  updated_at: string
}

export interface Neighborhood {
  id: string
  name: string
  city: string
  province: string
  slug: string | null
  cover_image: string | null
  latitude: number | null
  longitude: number | null
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface Building {
  id: string
  name: string
  address: string
  city: string
  province: string
  slug: string | null
  cover_image: string | null
  latitude: number | null
  longitude: number | null
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
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
  comment: string | null
  images: string[]
  is_anonymous: boolean
  display_name: string | null
  status: string
  created_at: string
  updated_at: string
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
  comment: string | null
  images: string[]
  is_anonymous: boolean
  display_name: string | null
  status: string
  created_at: string
  updated_at: string
}


