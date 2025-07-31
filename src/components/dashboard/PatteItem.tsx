'use client'

import { PatteItem } from '../../types/dashboard'
import OutilPatte from './OutilPatte'

interface PatteItemProps {
  item: PatteItem
  isSelected: (id: string, type: 'patte', outilIndex?: number) => boolean
  getItemQuantite: (id: string, type: 'patte', outilIndex?: number) => number
  toggleItemSelection: (id: string, type: 'patte', outilIndex?: number) => void
  updateQuantite: (id: string, type: 'patte', outilIndex: number | undefined, newQuantite: number) => void
}

export default function PatteItem({
  item,
  isSelected,
  getItemQuantite,
  toggleItemSelection,
  updateQuantite
}: PatteItemProps) {
  const outils = [1, 2, 3]
    .map(num => ({
      num,
      reference: item[`reference_outil_${num}` as keyof PatteItem],
      emplacement: item[`emplacement_outil_${num}` as keyof PatteItem]
    }))
    .filter(outil => outil.reference)

  const isAllSelected = isSelected(item.id, 'patte')

  return (
    <div key={`patte-${item.id}`} className="border border-blue-200 rounded-xl p-6 mb-6 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl text-blue-800 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-full">
              🔧
            </span>
            <span>Patte - {item.reference}</span>
          </h3>
          <p className="text-blue-600 mt-1">
            <span className="font-medium">Réf. patte/anneau:</span> {item.reference_patte_anneau}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-blue-100 px-3 py-2 rounded-lg">
          <span className="text-sm text-blue-700">Tout sélectionner</span>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={() => toggleItemSelection(item.id, 'patte')}
            className="h-5 w-5 text-blue-600 rounded border-blue-300 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {outils.map((outil) => (
          <OutilPatte
            key={`patte-${item.id}-outil-${outil.num}`}
            item={item}
            outil={outil}
            isSelected={isSelected}
            getItemQuantite={getItemQuantite}
            toggleItemSelection={toggleItemSelection}
            updateQuantite={updateQuantite}
          />
        ))}
      </div>

      {(item.commentaire || item.observation) && (
        <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-lg">
          {item.commentaire && (
            <p className="text-blue-800">
              <span className="font-semibold text-blue-700">Commentaire:</span> {item.commentaire}
            </p>
          )}
          {item.observation && (
            <p className="text-blue-800 mt-2">
              <span className="font-semibold text-blue-700">Observation:</span> {item.commentaire}
            </p>
          )}
        </div>
      )}
    </div>
  )
} 