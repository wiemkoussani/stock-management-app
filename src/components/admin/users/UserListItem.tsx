'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import UserPasswordForm from './UserPasswordForm'

interface UserListItemProps {
  user: {
    id: string
    email: string
    username: string
    created_at: string
    auth_created_at?: string
    email_confirmed?: boolean
    [key: string]: any
  }
  onRefresh?: () => void
}

export default function UserListItem({ user, onRefresh }: UserListItemProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePasswordUpdateSuccess = () => {
    setShowPasswordForm(false)
    onRefresh?.()
  }

  const handleDeleteUser = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" (${user.email}) ? Cette action est irréversible.`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Votre session a expiré, veuillez vous reconnecter')
      }

      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId: user.id })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Erreur ${response.status} lors de la suppression`)
      }

      alert('✅ Utilisateur supprimé avec succès')
      onRefresh?.()

    } catch (error) {
      console.error('Erreur suppression:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la suppression'
      setError(errorMessage)
      alert(`❌ Erreur: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm mb-4 transition-all hover:shadow-md hover:border-blue-300">
      {!showPasswordForm ? (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="font-semibold text-blue-900 text-lg">
                👤 {user.username || 'Sans pseudo'}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {user.email_confirmed !== undefined && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    user.email_confirmed 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {user.email_confirmed ? '✅ Email confirmé' : '⏳ En attente'}
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm text-blue-700 mt-2">
              <p className="flex items-center gap-2">
                <span className="text-blue-500">✉️</span>
                {user.email}
              </p>
              {user.created_at && (
                <p className="flex items-center gap-2 mt-1">
                  <span className="text-blue-500">📅</span>
                  Créé le {new Date(user.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <span>🔒</span>
              <span>Mot de passe</span>
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-300 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Suppression</span>
                </>
              ) : (
                <>
                  <span>🗑️</span>
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <UserPasswordForm
          user={user}
          onSuccess={handlePasswordUpdateSuccess}
          onCancel={() => {
            setShowPasswordForm(false)
            setError(null)
          }}
        />
      )}
    </div>
  )
} 