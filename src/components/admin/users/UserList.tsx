'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import UserListItem from './UserListItem'

interface User {
  id: string
  email: string
  username: string
  created_at: string
  email_confirmed?: boolean
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        router.push('/auth/login')
        return
      }
      
      const response = await fetch('/api/admin/get-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { users } = await response.json()
      setUsers(users || [])
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des utilisateurs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center mb-3">
          <span className="text-red-600 mr-2">⚠️</span>
          <p className="text-red-700 font-medium">Erreur de chargement</p>
        </div>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button 
          onClick={fetchUsers}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          👥 Liste des utilisateurs ({users.length})
        </h2>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              onRefresh={fetchUsers}
            />
          ))}
        </div>
      )}
    </div>
  )
} 