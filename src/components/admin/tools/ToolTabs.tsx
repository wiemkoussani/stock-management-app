'use client'
import { useState } from 'react'
import ToolFilters from './ToolFilters'
import ToolList from './ToolList'
import PatteToolForm from './PatteToolForm'
import CoupelleToolForm from './CoupelleToolForm'
import useAdminTools from '@/lib/hooks/useAdminTools'

const ToolTabs = () => {
  const [toolType, setToolType] = useState<'patte' | 'coupelle'>('patte')
  const [showAddForm, setShowAddForm] = useState(false)
  
  const {
    tools,
    loading,
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    deleteTool,
    refetch
  } = useAdminTools(toolType)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const printableElement = document.getElementById('printable-tools')?.cloneNode(true) as HTMLElement
      
      if (printableElement) {
        // Hide action buttons and header
        const noPrintElements = printableElement.querySelectorAll('.no-print')
        noPrintElements.forEach(el => {
          (el as HTMLElement).style.display = 'none'
        })
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Liste des Outils ${toolType === 'patte' ? 'Patte' : 'Coupelle'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
              h1 { color: #2c5282; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .print-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .print-footer { margin-top: 30px; font-size: 12px; text-align: center; }
              .no-print { display: none !important; }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>Liste des Outils ${toolType === 'patte' ? 'Patte' : 'Coupelle'}</h1>
              <div>Généré le: ${new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            ${printableElement?.outerHTML || '<p>Aucun outil à imprimer</p>'}
            <div class="print-footer">
              <p>© ${new Date().getFullYear()} - Votre Application</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs and Buttons */}
      <div className="flex items-center justify-between">
        {/* Tab Navigation */}
        <div className="flex border-b border-blue-200">
          <button
            onClick={() => setToolType('patte')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              toolType === 'patte'
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            Outils Patte
          </button>
          <button
            onClick={() => setToolType('coupelle')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              toolType === 'coupelle'
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            Outils Coupelle
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm no-print"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-2xl hover:scale-110 transition-transform no-print"
            title="Ajouter un nouvel outil"
            aria-label="Ajouter un nouvel outil"
          >
            🔧➕
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm no-print">
        <ToolFilters 
          toolType={toolType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          setSearchType={setSearchType}
        />
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-lg no-print">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              Ajouter un outil {toolType === 'patte' ? 'Patte' : 'Coupelle'}
            </h3>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-blue-500 hover:text-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {toolType === 'patte' ? (
            <PatteToolForm 
              onCancel={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false)
                refetch()
              }}
            />
          ) : (
            <CoupelleToolForm 
              onCancel={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false)
                refetch()
              }}
            />
          )}
        </div>
      )}

      {/* Tools List */}
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
        <div id="printable-tools">
          <ToolList 
            toolType={toolType}
            tools={tools}
            loading={loading}
            onEdit={() => {}}
            onDelete={deleteTool}
          />
        </div>
      </div>
    </div>
  )
}

export default ToolTabs 