'use client'
import { SearchType } from '@/types/admin'

interface ToolFiltersProps {
  toolType: 'patte' | 'coupelle'
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchType: SearchType
  setSearchType: (type: SearchType) => void
}

const ToolFilters = ({ 
  toolType,
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType 
}: ToolFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de recherche</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Entrez votre recherche..."
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  )
}

export default ToolFilters 