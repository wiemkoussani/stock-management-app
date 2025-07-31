'use client'

interface CaleModalProps {
  currentCaleItem: {
    assise: string
    axe: string | null
    outilIndex: number
    coupelleId: string
  }
  caleEpaisseur: number
  setCaleEpaisseur: (value: number) => void
  onCancel: () => void
  onConfirm: () => void
}

export default function CaleModal({
  currentCaleItem,
  caleEpaisseur,
  setCaleEpaisseur,
  onCancel,
  onConfirm
}: CaleModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Configuration de la cale</h3>
        <p className="mb-2"><span className="font-semibold">Assise:</span> {currentCaleItem.assise}</p>
        <p className="mb-4"><span className="font-semibold">Axe:</span> {currentCaleItem.axe}</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Épaisseur de la cale (mm)</label>
          <input
            type="number"
            min="0"
            max="10"
            value={caleEpaisseur}
            onChange={(e) => {
              const value = Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
              setCaleEpaisseur(value)
            }}
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Valeur entière entre 0 et 10 mm</p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}