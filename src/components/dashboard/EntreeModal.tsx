import React, { useState } from 'react'

interface EntreeModalProps {
  currentItem: {
    id: string
    reference: string
    reference_outil?: string
    emplacement: string
    nom_prenom_personne?: string
  }
  quantite: number
  onCancel: () => void
  onConfirm: (quantity: number) => void
}

export default function EntreeModal({ 
  currentItem, 
  quantite,
  onCancel, 
  onConfirm 
}: EntreeModalProps) {
  const [step1Checked, setStep1Checked] = useState(false)
  const [step2Checked, setStep2Checked] = useState(false)
  const [step3Checked, setStep3Checked] = useState(false)
  const [quantity, setQuantity] = useState(quantite)

  const allStepsCompleted = step1Checked && step2Checked && step3Checked

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Vérification Entrée Outillage
                </span>
              </h2>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-inner">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800">
                    <span className="text-blue-700">Emplacement:</span> {currentItem.emplacement}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 bg-white/80 px-3 py-1 rounded-full inline-block">
                    Référence: {currentItem.reference}
                    {currentItem.reference_outil && ` • ${currentItem.reference_outil}`}
                  </p>
                </div>
                <div className="w-1/4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 mt-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={step1Checked}
                    onChange={(e) => setStep1Checked(e.target.checked)}
                    className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-full focus:ring-blue-500 transition-all duration-200 group-hover:border-blue-400"
                  />
                </label>
              </div>
              <div className="flex-grow transition-all duration-200 group-hover:scale-[1.01]">
                <div className={`p-5 rounded-xl border-l-4 ${step1Checked ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-yellow-50 border-yellow-400'} transition-all duration-300`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${step1Checked ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'} flex items-center justify-center mr-3`}>
                      {step1Checked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-medium ${step1Checked ? 'text-green-800' : 'text-gray-900'}`}>
                        1. Vérification de l'outillage
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Contrôlez l'état et la conformité de l'outillage
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 mt-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={step2Checked}
                    onChange={(e) => setStep2Checked(e.target.checked)}
                    className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-full focus:ring-blue-500 transition-all duration-200 group-hover:border-blue-400"
                  />
                </label>
              </div>
              <div className="flex-grow transition-all duration-200 group-hover:scale-[1.01]">
                <div className={`p-5 rounded-xl border-l-4 ${step2Checked ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-blue-50 border-blue-400'} transition-all duration-300`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${step2Checked ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center mr-3`}>
                      {step2Checked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-medium ${step2Checked ? 'text-green-800' : 'text-gray-900'}`}>
                        2. Nettoyage de l'outillage
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Effectuez un nettoyage complet avant stockage
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 mt-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={step3Checked}
                    onChange={(e) => setStep3Checked(e.target.checked)}
                    className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-full focus:ring-blue-500 transition-all duration-200 group-hover:border-blue-400"
                  />
                </label>
              </div>
              <div className="flex-grow transition-all duration-200 group-hover:scale-[1.01]">
                <div className={`p-5 rounded-xl border-l-4 ${step3Checked ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-purple-50 border-purple-400'} transition-all duration-300`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${step3Checked ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'} flex items-center justify-center mr-3`}>
                      {step3Checked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 010-2h10V4H6v12H4V4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-medium ${step3Checked ? 'text-green-800' : 'text-gray-900'}`}>
                        3. Rangement de l'outillage
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Replacez l'outillage à son emplacement désigné
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-sm"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(quantity)}
              disabled={!allStepsCompleted}
              className={`px-8 py-2.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                allStepsCompleted
                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-md hover:from-blue-700 hover:to-blue-900'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirmer l'entrée
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 