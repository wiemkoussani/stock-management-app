import React from 'react'
import { X, AlertTriangle, Wrench } from 'lucide-react'

interface SeuilModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  seuilData: {
    reference: string
    reference_outil: string
    quantite: number
    quantiteActuelle: number
  } | null
  isNettoyageConfirmed: boolean
  setIsNettoyageConfirmed: (confirmed: boolean) => void
}

export default function SeuilModal({
  isOpen,
  onClose,
  onConfirm,
  seuilData,
  isNettoyageConfirmed,
  setIsNettoyageConfirmed
}: SeuilModalProps) {
  if (!isOpen || !seuilData) return null

  const handleConfirm = () => {
    if (isNettoyageConfirmed) {
      onConfirm()
      setIsNettoyageConfirmed(false) // Reset après confirmation
    }
  }

  const handleClose = () => {
    setIsNettoyageConfirmed(false) // Reset à la fermeture
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Dépassement de Seuil Détecté
              </h3>
              <p className="text-sm text-gray-500">Maintenance préventive requise</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message principal */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-800 mb-2">
                  Seuil de maintenance dépassé
                </h4>
                <div className="text-sm text-amber-700 space-y-1">
                  <p><strong>Outil :</strong> {seuilData.reference_outil}</p>
                  <p><strong>Référence :</strong> {seuilData.reference}</p>
                  <p>
                    <strong>Quantité :</strong> {seuilData.quantiteActuelle} + {seuilData.quantite} = {' '}
                    <span className="font-semibold text-red-600">
                      {seuilData.quantiteActuelle + seuilData.quantite}
                    </span>
                    {' '} &gt; 2500
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions de nettoyage */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Wrench className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-2">
                  Action requise
                </h4>
                <p className="text-sm text-blue-700">
                  Une maintenance préventive doit être effectuée avant la prochaine utilisation.
                  Veuillez procéder au nettoyage complet de l'outillage.
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox de confirmation */}
          <div className="border-2 border-gray-200 rounded-lg p-4 mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isNettoyageConfirmed}
                onChange={(e) => setIsNettoyageConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Je confirme que le nettoyage de l'outillage sera effectué
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Cette confirmation est obligatoire pour procéder à la sortie
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isNettoyageConfirmed}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                isNettoyageConfirmed
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isNettoyageConfirmed ? 'Confirmer la Sortie' : 'Confirmation Requise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}