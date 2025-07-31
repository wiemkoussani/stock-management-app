'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  username: string
  created_at?: string
  email?: string
  user_metadata?: {
    full_name?: string
    name?: string
  }
}

export default function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const getUsername = useCallback((user: UserProfile | null): string => {
    if (!user) return 'Utilisateur'
    return (
      user.username ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : '') ||
      'Utilisateur'
    )
  }, [])

  const getSessionId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='))
    return cookie ? cookie.split('=')[1] : null
  }, [])

  const clearSession = useCallback(() => {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    setUser(null)
    supabase.auth.signOut()
  }, [])

  const validateSession = useCallback(async (sessionId: string) => {
    try {
      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession()
      if (authError || !authSession) {
        clearSession()
        throw new Error('Invalid auth session')
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, created_at')
        .eq('id', sessionId)
        .single()

      if (error || !profile) {
        clearSession()
        throw new Error('Invalid profile session')
      }

      return {
        ...profile,
        email: authSession.user.email,
        user_metadata: authSession.user.user_metadata
      }
    } catch (error) {
      clearSession()
      throw error
    }
  }, [clearSession])

  const checkAuth = useCallback(async () => {
    try {
      const sessionId = getSessionId()
      if (!sessionId) throw new Error('No session')
      
      const profile = await validateSession(sessionId)
      setUser(profile)
    } catch (error) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [getSessionId, validateSession, router])

  useEffect(() => {
    checkAuth()
    const interval = setInterval(checkAuth, 300000)
    return () => clearInterval(interval)
  }, [checkAuth])

  const handleLogout = useCallback(() => {
    clearSession()
    router.push('/login')
  }, [clearSession, router])

  return {
    user,
    username: getUsername(user),
    loading,
    isAuthenticated: !!user,
    handleLogout,
    refreshAuth: checkAuth
  }
}