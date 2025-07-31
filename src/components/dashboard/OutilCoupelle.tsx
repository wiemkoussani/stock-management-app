'use client'

import { CoupelleItem } from '../../types/dashboard'

interface OutilCoupelleProps {
  item: CoupelleItem
  outil: {
    num: number
    assise: string | null
    empAss: string | null
    axe: string | null
    empAxe: string | null
    remarque: string | null
  }
  isSelected: (id: string, type: 'coupelle', outilIndex?: number, assise?: string | null, axe?: string | null) => boolean
  getItemQuantite: (id: string, type: 'coupelle', outilIndex?: number) => number
  toggleItemSelection: (id: string, type: 'coupelle', outilIndex?: number, assise?: string | null, axe?: string | null) => void
  updateQuantite: (id: string, type: 'coupelle', outilIndex: number | undefined, newQuantite: number) => void
}

export default function OutilCoupelle({
  item,
  outil,
  isSelected,
  getItemQuantite,
  toggleItemSelection,
  updateQuantite
}: OutilCoupelleProps) {
  const hasBoth = outil.assise && outil.axe
  const isSelectedFull = isSelected(item.id, 'coupelle', outil.num, outil.assise || null, outil.axe || null)
  const itemQuantite = getItemQuantite(item.id, 'coupelle', outil.num)

  return (
    <div className="bg-gray-50 p-3 rounded">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">Outil {outil.num}</h4>
        {hasBoth && (
          <input
            type="checkbox"
            checked={isSelectedFull}
            onChange={() => toggleItemSelection(item.id, 'coupelle', outil.num, outil.assise, outil.axe)}
            className="h-5 w-5 text-blue-600 rounded"
          />
        )}
      </div>
      
      {outil.assise && (
        <div className="mb-2">
          <p className="font-semibold">Assise:</p>
          <p>{outil.assise} ({outil.empAss})</p>
        </div>
      )}
      
      {outil.axe && (
        <div className="mb-2">
          <p className="font-semibold">Axe:</p>
          <p>{outil.axe} ({outil.empAxe})</p>
        </div>
      )}
      
      {!hasBoth && outil.assise && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm">Sélectionner assise</span>
          <input
            type="checkbox"
            checked={isSelected(item.id, 'coupelle', outil.num, outil.assise, null)}
            onChange={() => toggleItemSelection(item.id, 'coupelle', outil.num, outil.assise, null)}
            className="h-5 w-5 text-blue-600 rounded"
          />
        </div>
      )}
      
      {!hasBoth && outil.axe && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm">Sélectionner axe</span>
          <input
            type="checkbox"
            checked={isSelected(item.id, 'coupelle', outil.num, null, outil.axe)}
            onChange={() => toggleItemSelection(item.id, 'coupelle', outil.num, null, outil.axe)}
            className="h-5 w-5 text-blue-600 rounded"
          />
        </div>
      )}
      
      {outil.remarque && <p className="mt-1 text-sm italic">{outil.remarque}</p>}
      
      {(isSelectedFull || 
        isSelected(item.id, 'coupelle', outil.num, outil.assise, null) || 
        isSelected(item.id, 'coupelle', outil.num, null, outil.axe)) && (
        <div className="mt-2">
          <label className="block text-sm text-gray-600 mb-1">Quantité</label>
          <input
            type="number"
            min="1"
            value={itemQuantite}
            onChange={(e) => updateQuantite(item.id, 'coupelle', outil.num, Math.max(1, Number(e.target.value)))}
            className="w-full p-2 border rounded"
          />
        </div>
      )}
    </div>
  )
}