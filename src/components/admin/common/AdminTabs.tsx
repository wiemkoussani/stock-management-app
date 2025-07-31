// src/components/admin/common/AdminTabs.tsx
import React from 'react'

export type AdminTabType = 'users'| 'tools' | 'critical-tools' | 'history' |'outils-en-cours' | 'cale-history' |    'fiche-de-vie'

interface AdminTabsProps {
  activeTab: AdminTabType
  setActiveTab: (tab: AdminTabType) => void
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'users' as const, label: 'Gestion Utilisateurs', icon: '👥' } ,
    { id: 'tools' as const, label: 'Outils de soudage', icon: '🔧' },
    { id: 'critical-tools' as const, label: 'Outils Critique', icon: '⚠️' },
    { id: 'history' as const, label: 'Historique', icon: '📋' },
    { id: 'outils-en-cours' as const, label: 'Outils en cours', icon: '🔄' },
    { id: 'cale-history' as const, label: 'Historique des cales', icon: '📊' },
    { id: 'fiche-de-vie' as const, label: 'Fiche de Vie', icon: '📝' }
  ]

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default AdminTabs 