'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export interface User {
  id: string
  username: string
  created_at: string
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, created_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      // Delete from profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (profileError) throw profileError

      // Delete from auth.users using admin API
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) throw authError

      toast.success('User deleted successfully')
      fetchUsers() // Refresh the list
    } catch (err: any) {
      console.error('Error deleting user:', err)
      toast.error(err.message || 'Failed to delete user')
    }
  }

  const updateUser = async (userId: string, userData: { username: string; password?: string }) => {
    try {
      // Get user email for auth update
      const user = users.find(u => u.id === userId)
      if (!user) throw new Error('User not found')

      const currentEmail = `${user.username}@${user.username}.local`
      const newEmail = `${userData.username}@${userData.username}.local`

      // Update auth.users
      const updateData: any = {
        email: newEmail,
        user_metadata: { username: userData.username }
      }
      
      if (userData.password) {
        updateData.password = userData.password
      }

      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        updateData
      )
      
      if (authError) throw authError

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: userData.username })
        .eq('id', userId)
      
      if (profileError) throw profileError

      toast.success('User updated successfully')
      fetchUsers() // Refresh the list
    } catch (err: any) {
      console.error('Error updating user:', err)
      toast.error(err.message || 'Failed to update user')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    updateUser
  }
}