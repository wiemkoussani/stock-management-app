'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminTabs, { AdminTabType } from '@/components/admin/common/AdminTabs'
import ToolTabs from '@/components/admin/tools/ToolTabs'
import HistoryTabs from '@/components/admin/history/HistoryTabs'
import CaleHistoryTabs from '@/components/admin/cale-history/CaleHistoryTabs'
import UserList from '@/components/admin/users/UserList'
import CriticalToolsTabs from '@/components/admin/critical-tools/CriticalToolsTabs'
import OutilsEnCoursTable from '@/components/admin/outils-en-cours/OutilsEnCoursTable'
import FicheDeVie from '@/components/admin/fiche-de-vie/FicheDeVie'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTabType>('tools')
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  const getUsernameFromEmail = (email?: string) => {
    if (!email) return 'Utilisateur';
    const [username] = email.split('@');
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('Utilisateur non authentifié')
        router.push('/login')
        return
      }

      setCurrentUser(user)
      console.log('Utilisateur connecté:', user.email)

      const isAchref = user.email === 'achrefhorri@achrefhorri.local' ||
                      user.email?.includes('achrefhorri') ||
                      user.email?.includes('achref')

      if (isAchref) {
        console.log('Achref détecté - Accès admin accordé')
        setIsAuthorized(true)
        setLoading(false)
        return
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (roleError) {
        console.log('Erreur lors de la vérification du rôle:', roleError)
        setIsAuthorized(!!isAchref)
      } else if (roleData?.role === 'admin') {
        console.log('Rôle admin confirmé')
        setIsAuthorized(true)
      } else {
        console.log('Accès refusé - Pas de droits admin')
        setIsAuthorized(false)
      }

    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700">Vérification des droits d'accès...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md border border-blue-100 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Accès refusé</h2>
          <p className="text-blue-700 mb-6">
            Vous n'avez pas les droits nécessaires pour accéder à cette page.
            <br />
            Seuls les administrateurs peuvent accéder au panneau d'administration.
          </p>
          <div className="text-sm text-blue-600 mb-4">
            Utilisateur connecté: {currentUser?.email || 'Non connecté'}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-blue-100">
          <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-700">
              👤 Connecté en tant que: 
              <span className="font-medium ml-1 text-blue-900">
                {getUsernameFromEmail(currentUser?.email)}
              </span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">ADMIN</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 mb-6">
          <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
        {activeTab === 'users' && <UserList />}        
  {activeTab === 'tools' && <ToolTabs />}
  {activeTab === 'critical-tools' && <CriticalToolsTabs />}
  {activeTab === 'history' && <HistoryTabs />}
  {activeTab === 'outils-en-cours' && <OutilsEnCoursTable />}

  {activeTab === 'cale-history' && <CaleHistoryTabs />}
  
  {activeTab === 'fiche-de-vie' && <FicheDeVie />}
</div> 
        
        
      </div>
    </div>
  )
} 