'use client'
import { useState } from 'react'

interface UserTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function UserTabs({ activeTab, onTabChange }: UserTabsProps) {
  const tabs = [
    { id: 'list', label: 'Liste des Utilisateurs', icon: '👥' },
    { id: 'add', label: 'Ajouter Utilisateur', icon: '➕' }
  ]

  return (
    <div className="border-b border-blue-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700 bg-blue-50 rounded-t-lg'
                : 'border-transparent text-blue-500 hover:text-blue-600 hover:bg-blue-50/50'
            }`}
          >
            <span className="mr-2 text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
} 