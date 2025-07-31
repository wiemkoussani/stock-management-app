'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/lib/hooks/useAuth'
import useDashboard from '@/lib/hooks/useDashboard'
import { supabase } from '@/lib/supabase'

interface HistoryItem {
  id: string
  reference: string
  reference_outil: string | null
  emplacement: string | null
  nom_prenom_personne: string
  quantite: number
  date_operation: string
  activite?: string
}

// Interface pour les outils individuels des pattes
interface PatteOutil {
  id: string
  patteId: string
  reference: string
  reference_patte_anneau: string
  reference_outil: string
  emplacement_outil: string
  outilNumber: number
  commentaire?: string | null
  observation?: string | null
}

// Interface pour les coupelles individuelles
interface CoupelleSet {
  id: string
  coupelleId: string
  reference_amortisseur: string
  reference_coupelle: string
  assise_coupelle: string | null
  emp_ass: string | null
  axe_coupelle: string | null
  emp_axe: string | null
  remarque_outil: string | null
  setNumber: number
}

export default function FicheDeViePage() {
  const router = useRouter()
  const { username, handleLogout } = useAuth()
  const {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    coupelleItems,
    patteItems,
    isLoading,
    handleSearch,
  } = useDashboard()

  // State for fiche de vie specific functionality
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  // Processed items for display
  const [displayPatteOutils, setDisplayPatteOutils] = useState<PatteOutil[]>([])
  const [displayCoupelleSets, setDisplayCoupelleSets] = useState<CoupelleSet[]>([])

  // Process pattes to individual tools
  useEffect(() => {
    const processedOutils: PatteOutil[] = []
    
    patteItems.forEach(patte => {
      // Outil 1
      if (patte.reference_outil_1) {
        processedOutils.push({
          id: `${patte.id}_outil_1`,
          patteId: patte.id,
          reference: patte.reference,
          reference_patte_anneau: patte.reference_patte_anneau,
          reference_outil: patte.reference_outil_1,
          emplacement_outil: patte.emplacement_outil_1 || '',
          outilNumber: 1,
          commentaire: patte.commentaire,
          observation: patte.observation
        })
      }
      
      // Outil 2
      if (patte.reference_outil_2) {
        processedOutils.push({
          id: `${patte.id}_outil_2`,
          patteId: patte.id,
          reference: patte.reference,
          reference_patte_anneau: patte.reference_patte_anneau,
          reference_outil: patte.reference_outil_2,
          emplacement_outil: patte.emplacement_outil_2 || '',
          outilNumber: 2,
          commentaire: patte.commentaire,
          observation: patte.observation
        })
      }
      
      // Outil 3
      if (patte.reference_outil_3) {
        processedOutils.push({
          id: `${patte.id}_outil_3`,
          patteId: patte.id,
          reference: patte.reference,
          reference_patte_anneau: patte.reference_patte_anneau,
          reference_outil: patte.reference_outil_3,
          emplacement_outil: patte.emplacement_outil_3 || '',
          outilNumber: 3,
          commentaire: patte.commentaire,
          observation: patte.observation
        })
      }
    })
    
    setDisplayPatteOutils(processedOutils)
  }, [patteItems])

  // Process coupelles to sets (assise + axe)
  useEffect(() => {
    const processedSets: CoupelleSet[] = []
    
    coupelleItems.forEach(coupelle => {
      // Set 1
      if (coupelle.assise_coupelle_1 || coupelle.axe_coupelle_1) {
        processedSets.push({
          id: `${coupelle.id}_set_1`,
          coupelleId: coupelle.id,
          reference_amortisseur: coupelle.reference_amortisseur,
          reference_coupelle: coupelle.reference_coupelle,
          assise_coupelle: coupelle.assise_coupelle_1,
          emp_ass: coupelle.emp_ass_1,
          axe_coupelle: coupelle.axe_coupelle_1,
          emp_axe: coupelle.emp_axe_1,
          remarque_outil: coupelle.remarque_outil_1,
          setNumber: 1
        })
      }
      
      // Set 2
      if (coupelle.assise_coupelle_2 || coupelle.axe_coupelle_2) {
        processedSets.push({
          id: `${coupelle.id}_set_2`,
          coupelleId: coupelle.id,
          reference_amortisseur: coupelle.reference_amortisseur,
          reference_coupelle: coupelle.reference_coupelle,
          assise_coupelle: coupelle.assise_coupelle_2,
          emp_ass: coupelle.emp_ass_2,
          axe_coupelle: coupelle.axe_coupelle_2,
          emp_axe: coupelle.emp_axe_2,
          remarque_outil: coupelle.remarque_outil_2,
          setNumber: 2
        })
      }
      
      // Set 3
      if (coupelle.assise_coupelle_3 || coupelle.axe_coupelle_3) {
        processedSets.push({
          id: `${coupelle.id}_set_3`,
          coupelleId: coupelle.id,
          reference_amortisseur: coupelle.reference_amortisseur,
          reference_coupelle: coupelle.reference_coupelle,
          assise_coupelle: coupelle.assise_coupelle_3,
          emp_ass: coupelle.emp_ass_3,
          axe_coupelle: coupelle.axe_coupelle_3,
          emp_axe: coupelle.emp_axe_3,
          remarque_outil: coupelle.remarque_outil_3,
          setNumber: 3
        })
      }
    })
    
    setDisplayCoupelleSets(processedSets)
  }, [coupelleItems])

  // Modified search handler to track search state
  const handleSearchClick = async () => {
    setHasSearched(true)
    setSelectedItem(null)
    setShowHistory(false)
    await handleSearch(searchTerm)
  }
  const printHistory = (historyItems: HistoryItem[], item: any) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Fiche de Vie - Historique</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
              }
              .print-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
              }
              .print-title {
                color: #1e40af;
                font-size: 1.5rem;
                font-weight: 600;
              }
              .print-date {
                color: #6b7280;
                font-size: 0.875rem;
              }
              .header-info { 
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f0f9ff;
                border-radius: 5px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px;
              }
              th { 
                background-color: #1e40af; 
                color: white; 
                padding: 10px; 
                text-align: left;
                font-weight: 500;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              td { 
                padding: 8px; 
                border-bottom: 1px solid #ddd;
                font-size: 0.875rem;
              }
              tr:nth-child(even) { 
                background-color: #f0f9ff; 
              }
              .print-footer {
                margin-top: 20px;
                padding-top: 10px;
                border-top: 1px solid #e5e7eb;
                font-size: 0.75rem;
                color: #6b7280;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1 class="print-title">Fiche de Vie - Historique</h1>
              <div class="print-date">Généré le: ${new Date().toLocaleString('fr-FR')}</div>
            </div>
            
            <div class="header-info">
              <h2>${item.reference || item.reference_amortisseur}</h2>
              ${item.reference_outil ? `<p><strong>Outil:</strong> ${item.reference_outil}</p>` : ''}
            </div>
  
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Outil</th>
                  <th>Emplacement</th>
                  <th>Personne</th>
                  <th>Activité</th>
                  <th>Quantité</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${historyItems.map(item => `
                  <tr>
                    <td>${item.reference || '-'}</td>
                    <td>${item.reference_outil || '-'}</td>
                    <td>${item.emplacement || '-'}</td>
                    <td>${item.nom_prenom_personne}</td>
                    <td>${item.activite || '-'}</td>
                    <td>${item.quantite}</td>
                    <td>${formatDate(item.date_operation)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="print-footer">
              © ${new Date().getFullYear()} - Votre Application
            </div>
            
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 200);
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  } 

  // Function to clear search and return to home
  const handleClearSearch = () => {
    setHasSearched(false)
    setSearchTerm('')
    setSelectedItem(null)
    setShowHistory(false)
    setHistory([])
  }

  // Handle item selection - only one item at a time
  const handleItemSelection = (item: any) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item)
  }

  // Check if item is selected
  const isItemSelected = (itemId: string) => {
    return selectedItem?.id === itemId
  }

  // Handle validation - fetch history for selected item
  const handleValidation = async () => {
    if (!selectedItem) return

    setIsLoadingHistory(true)
    try {
      let query = supabase.from('historique').select('*')
      
      if (selectedItem.reference_outil) {
        query = query.eq('reference_outil', selectedItem.reference_outil)
      } else {
        query = query.eq('reference', selectedItem.reference || selectedItem.reference_amortisseur)
      }

      const { data, error: queryError } = await query.order('date_operation', { ascending: false })

      if (queryError) throw queryError

      setHistory(data || [])
      setShowHistory(true)
      setHasSearched(false)
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  // Check if we have search results
  const hasSearchResults = displayPatteOutils.length > 0 || displayCoupelleSets.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Form - Only show if not showing history */}
        {!showHistory && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Type de recherche</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="reference_amortisseur">Réf. amortisseur</option>
                  <option value="reference_composant">Réf. composant</option>
                  <option value="reference_outils">Réf. outils</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Référence</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez la référence..."
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearchClick}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !showHistory && (
          <>
            <div className="mb-6">
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600">Recherche en cours...</span>
              </div>
            )}

            {/* Pattes Results - Un rectangle par outil */}
            {displayPatteOutils.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-blue-800">Outils Pattes ({displayPatteOutils.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayPatteOutils.map(outil => (
                    <div
                      key={outil.id}
                      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 border-2 ${
                        isItemSelected(outil.id)
                          ? 'border-blue-500 bg-blue-50 shadow-xl transform scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                      }`}
                      onClick={() => handleItemSelection(outil)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            PATTE - OUTIL {outil.outilNumber}
                          </span>
                          <div className={`w-3 h-3 rounded-full ${isItemSelected(outil.id) ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {outil.reference}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Réf. Patte Anneau:</span> {outil.reference_patte_anneau}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-bold text-blue-800">Référence Outil:</span>
                              <span className="text-sm font-medium text-blue-900">{outil.reference_outil}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-bold text-blue-800">Emplacement:</span>
                              <span className="text-sm font-medium text-blue-900">{outil.emplacement_outil || 'N/A'}</span>
                            </div>
                          </div>

                          {outil.commentaire && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                              <span className="text-xs font-medium text-gray-600">Commentaire:</span>
                              <p className="text-xs text-gray-700 mt-1">{outil.commentaire}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coupelles Results - Un rectangle par set (assise + axe) */}
            {displayCoupelleSets.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-blue-800">Coupelles ({displayCoupelleSets.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayCoupelleSets.map(set => (
                    <div
                      key={set.id}
                      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 border-2 ${
                        isItemSelected(set.id)
                          ? 'border-green-500 bg-green-50 shadow-xl transform scale-105'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-xl'
                      }`}
                      onClick={() => handleItemSelection(set)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            COUPELLE - SET {set.setNumber}
                          </span>
                          <div className={`w-3 h-3 rounded-full ${isItemSelected(set.id) ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {set.reference_amortisseur}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Réf. Coupelle:</span> {set.reference_coupelle}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {set.assise_coupelle && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold text-green-800">Assise:</span>
                                <span className="text-sm font-medium text-green-900">{set.assise_coupelle}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-bold text-green-800">Emp. Assise:</span>
                                <span className="text-sm font-medium text-green-900">{set.emp_ass || 'N/A'}</span>
                              </div>
                            </div>
                          )}

                          {set.axe_coupelle && (
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold text-orange-800">Axe:</span>
                                <span className="text-sm font-medium text-orange-900">{set.axe_coupelle}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-bold text-orange-800">Emp. Axe:</span>
                                <span className="text-sm font-medium text-orange-900">{set.emp_axe || 'N/A'}</span>
                              </div>
                            </div>
                          )}

                          {set.remarque_outil && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                              <span className="text-xs font-medium text-gray-600">Remarque:</span>
                              <p className="text-xs text-gray-700 mt-1">{set.remarque_outil}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !hasSearchResults && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-blue-200">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467.901-6.058 2.375l-.467.687a1 1 0 001.598 1.213L8 18.5l1-1.5h2l1 1.5.927.775a1 1 0 001.598-1.213l-.467-.687z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Aucun résultat trouvé pour cette recherche.</p>
              </div>
            )}
          </>
        )}

        {/* History Results */}
        {showHistory && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Nouvelle recherche
              </button>
              <h2 className="text-xl font-bold text-blue-800">
                Historique - {selectedItem?.reference || selectedItem?.reference_amortisseur}
              </h2>
            </div>

            {isLoadingHistory && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600">Chargement de l'historique...</span>
              </div>
            )}

{!isLoadingHistory && history.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
    <div className="p-4 border-b border-blue-100 bg-blue-50 flex justify-between items-center">
      <h3 className="font-medium text-blue-800">
        Historique complet - {history.length} opérations trouvées
      </h3>
      <button
        onClick={() => printHistory(history, selectedItem)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimer
      </button>
    </div> 
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Référence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Référence Outil
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emplacement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Personne
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.reference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.reference_outil || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.emplacement || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.nom_prenom_personne}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.activite || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantite}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.date_operation)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!isLoadingHistory && history.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-blue-200">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467.901-6.058 2.375l-.467.687a1 1 0 001.598 1.213L8 18.5l1-1.5h2l1 1.5.927.775a1 1 0 001.598-1.213l-.467-.687z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Aucun historique trouvé pour cet élément.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Footer */}
      {selectedItem && hasSearched && !showHistory && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <span className="font-medium">Élément sélectionné:</span>
                <span className="ml-2 font-bold">{selectedItem.reference || selectedItem.reference_amortisseur}</span>
                {selectedItem.reference_outil && (
                  <span className="ml-2 text-blue-200">({selectedItem.reference_outil})</span>
                )}
              </div>
            </div>
            <button
              onClick={handleValidation}
              disabled={isLoadingHistory}
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 flex items-center transition-all"
            >
              {isLoadingHistory ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  Chargement...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Voir l'historique complet
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 