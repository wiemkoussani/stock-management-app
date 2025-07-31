'use client'

import { useState, useEffect } from 'react'
import { SearchType, MouvementType, OutilEnCours } from '@/types/dashboard'

// 1. Correction dans SearchForm.tsx - Interface
interface SearchFormProps {
  searchType: SearchType
  setSearchType: (type: SearchType) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  quantite: number
  setQuantite: (qty: number) => void
  mouvementType: MouvementType
  setMouvementType: (type: MouvementType) => void
  isLoading: boolean
  onSearch: (term: string) => void // ✅ CORRECTION : Accepte un paramètre term
  outilsEnCours: OutilEnCours[]
  onSelectOutilEnCours: (outil: OutilEnCours) => void
}

// 2. Correction dans SearchForm.tsx - Composant
export default function SearchForm({
  searchType,
  setSearchType,
  searchTerm,
  setSearchTerm,
  quantite,
  setQuantite,
  mouvementType,
  setMouvementType,
  isLoading,
  onSearch,
  outilsEnCours,
  onSelectOutilEnCours
}: SearchFormProps) {
  const [filteredOutils, setFilteredOutils] = useState<OutilEnCours[]>([])

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = outilsEnCours.filter(outil => 
        outil.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (outil.reference_outil && outil.reference_outil.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredOutils(filtered)
    } else {
      setFilteredOutils([])
    }
  }, [searchTerm, outilsEnCours])

  // ✅ CORRECTION : Fonction wrapper pour passer le searchTerm
  const handleSearchClick = () => {
    onSearch(searchTerm)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type de recherche</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="w-full p-2 border rounded"
          >
            <option value="reference_amortisseur">Réf. amortisseur</option>
            <option value="reference_composant">Réf. composant</option>
            <option value="reference_outils">Réf. outils</option>
          </select>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Rechercher</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // ✅ CORRECTION : Utiliser la nouvelle fonction
            className="w-full p-2 border rounded"
            placeholder="Entrez votre recherche..."
          />
          
          {filteredOutils.length > 0 && mouvementType === 'entree' && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredOutils.map(outil => (
                <div 
                  key={outil.id}
                  className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                  onClick={() => {
                    onSelectOutilEnCours(outil)
                    setSearchTerm('')
                  }}
                >
                  <div className="font-medium">{outil.reference_outil}</div>
                  <div className="text-sm text-gray-600">{outil.reference}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Quantité</label>
          <input
            type="number"
            min="0"
            value={quantite}
            onChange={(e) => setQuantite(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Type de mouvement</label>
          <select
            value={mouvementType}
            onChange={(e) => setMouvementType(e.target.value as MouvementType)}
            className="w-full p-2 border rounded"
          >
            <option value="entree">Entrée</option>
            <option value="sortie">Sortie</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleSearchClick} // ✅ CORRECTION : Utiliser la nouvelle fonction
            disabled={isLoading}
            className={`w-full p-2 rounded text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>
    </div>
  )
} 