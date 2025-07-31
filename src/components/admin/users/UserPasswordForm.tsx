'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserPasswordFormProps {
  user: {
    id: string
    email: string
    username: string
    [key: string]: any
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function UserPasswordForm({ user, onSuccess, onCancel }: UserPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      // Get session once
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      const isChangingOwnPassword = currentUser && currentUser.id === user.id
      
      if (!session?.access_token) {
        throw new Error('Pas de token d\'accès disponible')
      }

      const response = await fetch('/api/admin/update-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword: newPassword
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      // If user is changing their own password
      if (isChangingOwnPassword) {
        setMessage('✅ Mot de passe mis à jour avec succès! Vous allez être redirigé pour vous reconnecter...')
        
        setTimeout(() => {
          supabase.auth.signOut().then(() => {
            router.push('/auth/login?message=Mot de passe changé, veuillez vous reconnecter')
          })
        }, 2000)
        
        return
      }

      // If changing another user's password
      setMessage('✅ Mot de passe mis à jour avec succès!')
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => {
        onSuccess?.()
      }, 1500)

    } catch (error) {
      console.error('Erreur:', error)
      setMessage('❌ ' + (error instanceof Error ? error.message : 'Une erreur inconnue est survenue'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Changer le mot de passe
      </h3>
      
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <strong>Utilisateur:</strong> {user.username}
        </p>
        
        <p className="text-sm text-gray-600">
          <strong>ID:</strong> {user.id}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 6 caractères"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Répéter le mot de passe"
            minLength={6}
            required
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !newPassword || newPassword !== confirmPassword}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 