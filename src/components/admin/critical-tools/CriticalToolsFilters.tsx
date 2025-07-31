'use client'
import { SearchType } from '@/types/admin'
import { useEffect } from 'react'

interface CriticalToolsFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchType: SearchType
  setSearchType: (type: SearchType) => void
  onSearch: () => void
  onReset: () => void
}

const CriticalToolsFilters = ({ 
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  onSearch,
  onReset
}: CriticalToolsFiltersProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        onSearch()
      } else {
        onReset()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm, searchType])

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de recherche</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="reference_amortisseur">Réf. amortisseur</option>
            <option value="reference_composant">Réf. composant</option>
            <option value="reference_outils">Réf. outils</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez votre référence..."
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('')
              setSearchType('reference_amortisseur')
              onReset()
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 w-full transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  )
}

export default CriticalToolsFilters