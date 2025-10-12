// Admin authentication utilities

import { supabase } from './supabase'

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return false
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()
  
  return profile?.is_admin || false
}

/**
 * Get admin profile
 */
export async function getAdminProfile() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  return profile
}

/**
 * Require admin access - redirect if not admin
 */
export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
  return true
}

