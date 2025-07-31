'use client'
import { useState } from 'react'
import { useAdminUsers } from '@/lib/hooks/useAdminUsers'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  created_at: string
}

interface UserEditModalProps {
  user: User
  onClose: () => void
}

export default function UserEditModal({ user, onClose }: UserEditModalProps) {
  const { updateUser } = useAdminUsers()
  const [formData, setFormData] = useState({
    username: user.username,
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const username = formData.username.trim()
    const password = formData.password
    
    // Basic validation
    if (username.length < 3) {
      toast.error('Le nom d\'utilisateur doit contenir au moins 3 caractères')
      return
    }
    
    // Password validation only if password is provided
    if (password) {
      if (password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères')
        return
      }
      
      if (password !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }
    }

    setLoading(true)
    
    try {
      const updateData: any = { username }
      if (password) {
        updateData.password = password
      }
      
      await updateUser(user.id, updateData)
      onClose()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Modifier l'utilisateur
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={3}
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Nouveau mot de passe 
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Laissez vide pour ne pas changer"
              minLength={8}
            />
          </div>
          
          {formData.password && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirmez le nouveau mot de passe"
                required
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'OK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 