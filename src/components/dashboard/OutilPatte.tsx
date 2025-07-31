'use client'

import { PatteItem } from '../../types/dashboard'

interface OutilPatteProps {
  item: PatteItem
  outil: {
    num: number
    reference: string | null
    emplacement: string | null
  }
  isSelected: (id: string, type: 'patte', outilIndex?: number) => boolean
  getItemQuantite: (id: string, type: 'patte', outilIndex?: number) => number
  toggleItemSelection: (id: string, type: 'patte', outilIndex?: number) => void
  updateQuantite: (id: string, type: 'patte', outilIndex: number | undefined, newQuantite: number) => void
}

export default function OutilPatte({
  item,
  outil,
  isSelected,
  getItemQuantite,
  toggleItemSelection,
  updateQuantite
}: OutilPatteProps) {
  const isSelectedOutil = isSelected(item.id, 'patte', outil.num)
  const itemQuantite = getItemQuantite(item.id, 'patte', outil.num)

  return (
    <div className="bg-gray-50 p-3 rounded">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">Outil {outil.num}</h4>
        <input
          type="checkbox"
          checked={isSelectedOutil}
          onChange={() => toggleItemSelection(item.id, 'patte', outil.num)}
          className="h-5 w-5 text-blue-600 rounded"
        />
      </div>
      
      <p className="font-semibold">Référence:</p>
      <p>{outil.reference}</p>
      
      <p className="font-semibold mt-2">Emplacement:</p>
      <p>{outil.emplacement}</p>
      
      {isSelectedOutil && (
        <div className="mt-2">
          <label className="block text-sm text-gray-600 mb-1">Quantité</label>
          <input
            type="number"
            min="0"
            value={itemQuantite}
            onChange={(e) => updateQuantite(item.id, 'patte', outil.num, Math.max(0, Number(e.target.value)))}
            className="w-full p-2 border rounded"
          />
        </div>
      )}
    </div>
  )
}