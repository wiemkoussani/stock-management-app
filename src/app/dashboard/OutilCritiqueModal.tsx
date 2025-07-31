import React from 'react'
import { X, ShieldAlert, Wrench, AlertCircle } from 'lucide-react'

interface OutilCritiqueModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  outilsCritiques: Array<{ reference_outil: string }>
  isNettoyageConfirmed: boolean
  setIsNettoyageConfirmed: (confirmed: boolean) => void
}

export default function OutilCritiqueModal({
  isOpen,
  onClose,
  onConfirm,
  outilsCritiques,
  isNettoyageConfirmed,
  setIsNettoyageConfirmed
}: OutilCritiqueModalProps) {
  if (!isOpen || !outilsCritiques.length) return null

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
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Outils Critiques Détectés
              </h3>
              <p className="text-sm text-gray-500">Attention particulière requise</p>
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
          {/* Message d'alerte */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-2">
                  ⚠️ Outils critiques dans votre sélection
                </h4>
                
                
                {/* Liste des outils critiques */}
                <div className="bg-white border border-red-200 rounded-md p-3">
                  <ul className="space-y-2">
                    {outilsCritiques.map((outil, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {outil.reference_outil}
                        </span>
                      </li>
                    ))}
                  </ul>
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
                  Procédure obligatoire
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Vérification de l'état général</li>
                    <li>Nettoyage des surfaces de contact</li>
                    <li>Contrôle des tolérances</li>
                  </ul>
                </div>
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
                className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Je confirme avoir pris connaissance de la criticité de ces outils
                  et je m'engage à effectuer le nettoyage requis
                </span>
                
              </div>
            </label>
          </div>

          

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isNettoyageConfirmed}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                isNettoyageConfirmed
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isNettoyageConfirmed ? 'Confirmer la Validation' : 'Confirmation Requise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}