'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/lib/hooks/useAuth'
import useDashboard from '@/lib/hooks/useDashboard'
import AuthSection from '@/components/dashboard/AuthSection'
import SearchForm from '@/components/dashboard/SearchForm'
import HistoryTable from '@/components/dashboard/HistoryTable'
import EntryHistoryTable from '@/components/dashboard/EntryHistoryTable'
import CoupelleItem from '@/components/dashboard/CoupelleItem'
import PatteItem from '@/components/dashboard/PatteItem'
import ValidationFooter from '@/components/dashboard/ValidationFooter'
import CaleModal from '@/components/dashboard/CaleModal'
import EntreeModal from '@/components/dashboard/EntreeModal'
import OutilsEnCoursTable from '@/components/dashboard/OutilsEnCoursTable'
import OutilWarningModal from '@/components/dashboard/OutilWarningModal'
import SeuilModal from './SeuilModal'
import OutilCritiqueModal from './OutilCritiqueModal' 
import CaleExistanteModal from './CaleExistanteModal'


export default function DashboardPage() {
  const router = useRouter()
  const { username, handleLogout } = useAuth()
  const {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    quantite,
    setQuantite,
    mouvementType,
    setMouvementType,
    caleEpaisseur,
    setCaleEpaisseur,
    coupelleItems,
    patteItems,
    selectedItems,
    isLoading,
    showCaleModal,
    showEntreeModal,
    todayHistory,
    todayEntryHistory,
    currentCaleItem,
    currentEntreeItem,
    outilsEnCours,
    showOutilWarning,
    warningMessage,
    setSelectedItems,
    setShowCaleModal,
    setCurrentCaleItem,
    setShowEntreeModal,
    setCurrentEntreeItem,
    setShowOutilWarning,
    handleSearch,
    toggleItemSelection,
    isItemSelected,
    getItemQuantite,
    updateQuantite,
    handleCaleConfirmation,
    handleEntreeConfirmation,
    handleValidation,
    handleSelectOutilEnCours,
    loadTodayHistory , 
    showSeuilModal,
    setShowSeuilModal,
    seuilModalData,
    showOutilCritiqueModal, 
    setShowOutilCritiqueModal,
    outilsCritiquesData,
    isNettoyageConfirmed,
    setIsNettoyageConfirmed,
    handleSeuilConfirmation,
    handleOutilCritiqueConfirmation, 
    showCaleExistanteModal,
  caleExistanteData,
  handleCaleExistanteConfirmation,
  handleCaleExistanteCancel, 
  } = useDashboard()

  // State for active tab and search state
  const [activeTab, setActiveTab] = useState<'history' | 'outils'>('history')
  const [hasSearched, setHasSearched] = useState(false)

  // Effect to change active tab when movement type changes
  useEffect(() => {
    if (mouvementType === 'entree') {
      setActiveTab('outils')
    } else {
      setActiveTab('history')
    }
  }, [mouvementType])

  // Modified search handler to track search state
  const handleSearchClick = async () => {
    setHasSearched(true)
    await handleSearch(searchTerm)
  }

  // Modified validation handler to reset search state
  const handleValidationClick = async () => {
    await handleValidation()
    setHasSearched(false)
    // Clear search term after validation
    setSearchTerm('')
  }

  // Function to clear search and return to home
  const handleClearSearch = () => {
    setHasSearched(false)
    setSearchTerm('')
  }

  // Check if we have search results (items found)
  const hasSearchResults = coupelleItems.length > 0 || patteItems.length > 0

  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      {/* Cale Modal */}
      {showCaleModal && currentCaleItem && (
        <CaleModal 
          currentCaleItem={currentCaleItem}
          caleEpaisseur={caleEpaisseur}
          setCaleEpaisseur={setCaleEpaisseur}
          onCancel={() => {
            setShowCaleModal(false)
            setCurrentCaleItem(null)
          }}
          onConfirm={() => handleCaleConfirmation(caleEpaisseur)}
        />
      )}

      {/* Entree Modal */}
      {showEntreeModal && currentEntreeItem && (
        <EntreeModal 
          currentItem={currentEntreeItem}
          quantite={quantite}
          onCancel={() => {
            setShowEntreeModal(false)
            setCurrentEntreeItem(null)
          }}
          onConfirm={handleEntreeConfirmation}
        />
      )}

      {/* Outil Warning Modal */}
      {showOutilWarning && (
        <OutilWarningModal 
          message={warningMessage}
          onClose={() => setShowOutilWarning(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Auth Section */}
        <AuthSection username={username} onLogout={handleLogout} />

        {/* Search Form */}
        <div className="bg-blue-100 rounded-lg shadow-md p-6 mb-8 border border-blue-200">
          <SearchForm
            searchType={searchType}
            setSearchType={setSearchType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            quantite={quantite}
            setQuantite={setQuantite}
            mouvementType={mouvementType}
            setMouvementType={setMouvementType}
            isLoading={isLoading}
            onSearch={handleSearchClick}
            outilsEnCours={outilsEnCours}
            onSelectOutilEnCours={handleSelectOutilEnCours}
          />
        </div>

        {/* Only show tabs and their content if no search has been performed */}
        {!hasSearched && (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-blue-200 mb-6">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'}`}
                onClick={() => setActiveTab('history')}
              >
                Historique du jour
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'outils' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'}`}
                onClick={() => setActiveTab('outils')}
              >
                Outils en cours
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'history' ? (
              <>
                {/* History - Show based on movement type */}
                {mouvementType === 'sortie' && todayHistory.length > 0 && (
                  <div className="bg-blue-100 rounded-lg shadow-md p-6 mb-8 border border-blue-200">
                    <HistoryTable history={todayHistory} />
                  </div>
                )}

                {mouvementType === 'entree' && todayEntryHistory.length > 0 && (
                  <div className="bg-blue-100 rounded-lg shadow-md p-6 mb-8 border border-blue-200">
                    <EntryHistoryTable history={todayEntryHistory} />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-blue-200">
                <OutilsEnCoursTable 
                  outils={outilsEnCours} 
                  onSelect={handleSelectOutilEnCours}
                  mouvementType={mouvementType}
                />
              </div>
            )}
          </>
        )}

        {/* Search Results - Only show when search has been performed */}
        {hasSearched && (
          <>
            {/* Clear search button */}
            <div className="mb-6">
            <button
  onClick={handleClearSearch}
  className="bg-gradient-to-br from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-800 font-medium py-2 px-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 ring-1 ring-blue-100/50 hover:ring-blue-200/70"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
  <span>Retour</span>
</button>
            </div>

            {/* Show loading */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600">Recherche en cours...</span>
              </div>
            )}

            {/* Pattes Results */}
            {patteItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-blue-200">
                <h2 className="text-xl font-bold mb-4 text-blue-800">Pattes ({patteItems.length})</h2>
                {patteItems.map(item => (
                  <PatteItem
                    key={item.id}
                    item={item}
                    isSelected={isItemSelected}
                    getItemQuantite={getItemQuantite}
                    toggleItemSelection={toggleItemSelection}
                    updateQuantite={updateQuantite}
                  />
                ))}
              </div>
            )}

            {/* Coupelles Results */}
            {coupelleItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-blue-200">
                <h2 className="text-xl font-bold mb-4 text-blue-800">Coupelles ({coupelleItems.length})</h2>
                {coupelleItems.map(item => (
                  <CoupelleItem
                    key={item.id}
                    item={item}
                    isSelected={isItemSelected}
                    getItemQuantite={getItemQuantite}
                    toggleItemSelection={toggleItemSelection}
                    updateQuantite={updateQuantite}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Validation Footer - Only show for sortie mode and when items are selected */}
      {mouvementType === 'sortie' && selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-700 text-white p-4 shadow-lg">
          <ValidationFooter 
            selectedItems={selectedItems}
            coupelleItems={coupelleItems}
            patteItems={patteItems}
            onValidate={handleValidationClick}
          />
        </div>
      )}
      <SeuilModal
        isOpen={showSeuilModal}
        onClose={() => setShowSeuilModal(false)}
        onConfirm={handleSeuilConfirmation}
        seuilData={seuilModalData}
        isNettoyageConfirmed={isNettoyageConfirmed}
        setIsNettoyageConfirmed={setIsNettoyageConfirmed}
      />

      {/* Modale d'outils critiques */}
      <OutilCritiqueModal
        isOpen={showOutilCritiqueModal}
        onClose={() => setShowOutilCritiqueModal(false)}
        onConfirm={handleOutilCritiqueConfirmation}
        outilsCritiques={outilsCritiquesData}
        isNettoyageConfirmed={isNettoyageConfirmed}
        setIsNettoyageConfirmed={setIsNettoyageConfirmed}
      /> 

<CaleExistanteModal
  isOpen={showCaleExistanteModal}
  onClose={handleCaleExistanteCancel}
  onConfirm={handleCaleExistanteConfirmation}
  epaisseur={caleExistanteData?.epaisseur || 0}
  assise={caleExistanteData?.assise || ''}
  axe={caleExistanteData?.axe || ''}
/> 
    </div>
  )
} 