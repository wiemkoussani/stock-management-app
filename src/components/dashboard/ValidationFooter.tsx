'use client'

import { SelectedItem, CoupelleItem, PatteItem } from '../../types/dashboard'
import { FaExclamationTriangle } from 'react-icons/fa'

interface ValidationFooterProps {
  selectedItems: SelectedItem[]
  coupelleItems: CoupelleItem[]
  patteItems: PatteItem[]
  onValidate: () => void
}

export default function ValidationFooter({
  selectedItems,
  coupelleItems,
  patteItems,
  onValidate
}: ValidationFooterProps) {
  const hasCriticalItems = selectedItems.some(item => {
    const historiqueItem = item.type === 'coupelle' 
      ? coupelleItems.find(c => c.id === item.id)
      : patteItems.find(p => p.id === item.id)
    
    return item.quantite > 2500
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <span className="font-semibold">{selectedItems.length} élément(s) sélectionné(s)</span>
          {selectedItems.some(item => item.type === 'coupelle' && item.caleEpaisseur) && (
            <span className="ml-4 text-sm text-gray-600">
              {selectedItems.filter(item => item.type === 'coupelle' && item.caleEpaisseur).length} cale(s) à créer
            </span>
          )}
        </div>
        <button
          onClick={onValidate}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow flex items-center"
        >
          Valider la sélection
          {hasCriticalItems && (
            <FaExclamationTriangle className="ml-2 text-yellow-300" />
          )}
        </button>
      </div>
    </div>
  )
}