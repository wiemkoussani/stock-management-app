'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const username = formData.username.trim()
      const password = formData.password
      
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      // 1. Construct the consistent email format
      const email = `${username}@${username}.local`

      // 2. Attempt Supabase authentication
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError
      if (!user) throw new Error('Authentication failed')

      // 3. Get additional profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('User profile not found')
      }

      // 4. Set session cookie
      const expirationDate = new Date()
      expirationDate.setTime(expirationDate.getTime() + (24 * 60 * 60 * 1000))
      document.cookie = `session=${user.id}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`

      toast.success('Logged in successfully!')
      
      // 5. Redirect based on username
      setTimeout(() => {
        if (profile.username.toLowerCase() === 'admin' || profile.username.toLowerCase() === 'achrefhorri') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }, 500)

    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/register" className="text-blue-600 hover:text-blue-800 text-sm">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  )
} 