import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

export async function checkAdminAccess() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Non authentifié')
  }

  // Vérifier si c'est Achref ou un admin
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || roleData?.role !== 'admin') {
    // Vérifier aussi par email au cas où
    if (user.email !== 'achrefhorri@example.com') { // Remplacez par le vrai email
      throw new Error('Accès non autorisé - Droits administrateur requis')
    }
  }

  return user
}

// Hook React pour vérifier les droits admin
export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null) // Fix: Specify the correct type

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const currentUser = await checkAdminAccess()
      setUser(currentUser)
      setIsAdmin(true)
    } catch (error) {
      console.error('Vérification admin:', error)
      setIsAdmin(false)
      setUser(null) // Reset user on error
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading, user, checkAdminStatus }
} 