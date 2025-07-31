'use client'

import { CoupelleItem as CoupelleItemType } from '../../types/dashboard'
import OutilCoupelle from './OutilCoupelle'

interface CoupelleItemProps {
  item: CoupelleItemType
  isSelected: (id: string, type: 'coupelle', outilIndex?: number, assise?: string | null, axe?: string | null) => boolean
  getItemQuantite: (id: string, type: 'coupelle', outilIndex?: number) => number
  toggleItemSelection: (id: string, type: 'coupelle', outilIndex?: number, assise?: string | null, axe?: string | null) => void
  updateQuantite: (id: string, type: 'coupelle', outilIndex: number | undefined, newQuantite: number) => void
}

export default function CoupelleItem({
  item,
  isSelected,
  getItemQuantite,
  toggleItemSelection,
  updateQuantite
}: CoupelleItemProps) {
  const outils = [1, 2, 3]
    .map(num => ({
      num,
      assise: item[`assise_coupelle_${num}` as keyof CoupelleItemType],
      empAss: item[`emp_ass_${num}` as keyof CoupelleItemType],
      axe: item[`axe_coupelle_${num}` as keyof CoupelleItemType],
      empAxe: item[`emp_axe_${num}` as keyof CoupelleItemType],
      remarque: item[`remarque_outil_${num}` as keyof CoupelleItemType]
    }))
    .filter(outil => outil.assise || outil.axe)

  const isAllSelected = isSelected(item.id, 'coupelle')

  return (
    <div key={`coupelle-${item.id}`} className="border border-blue-200 rounded-xl p-6 mb-6 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl text-blue-800 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-full">
              ⚙️
            </span>
            <span>Coupelle - {item.reference_coupelle}</span>
          </h3>
          <p className="text-blue-600 mt-1">
            <span className="font-medium">Réf. amortisseur:</span> {item.reference_amortisseur}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-blue-100 px-3 py-2 rounded-lg">
          <span className="text-sm text-blue-700">Sélectionner tout</span>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={() => toggleItemSelection(item.id, 'coupelle')}
            className="h-5 w-5 text-blue-600 rounded border-blue-300 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {outils.map((outil) => (
          <OutilCoupelle
            key={`coupelle-${item.id}-outil-${outil.num}`}
            item={item}
            outil={outil}
            isSelected={isSelected}
            getItemQuantite={getItemQuantite}
            toggleItemSelection={toggleItemSelection}
            updateQuantite={updateQuantite}
          />
        ))}
      </div>
    </div>
  )
} 