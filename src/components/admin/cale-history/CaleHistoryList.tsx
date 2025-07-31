'use client'
import { CaleHistoryItem } from '@/types/admin'

interface CaleHistoryListProps {
  caleHistoryItems: CaleHistoryItem[]
  loading: boolean
  onEdit: (item: CaleHistoryItem) => void
  onDelete: (id: string) => void
  sortBy: string
  dateFilter: string
  customDate: { start?: string; end?: string }
  assiseFilter: string
  axeFilter: string
}

const CaleHistoryList = ({ 
  caleHistoryItems, 
  loading, 
  onEdit, 
  onDelete,
  sortBy,
  dateFilter,
  customDate,
  assiseFilter,
  axeFilter
}: CaleHistoryListProps) => {
  const printHistory = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Historique des Cales</title>
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
              .filters { 
                margin-bottom: 20px; 
                padding: 15px; 
                background-color: #f0f9ff; 
                border-radius: 5px; 
              }
              .filter-row { 
                display: flex; 
                margin-bottom: 5px; 
              }
              .filter-label { 
                font-weight: bold; 
                min-width: 150px; 
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px;
                font-size: 0.875rem;
              }
              th { 
                background-color: #1e40af; 
                color: white; 
                padding: 8px; 
                text-align: left; 
              }
              td { 
                padding: 6px; 
                border-bottom: 1px solid #ddd; 
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
              <h1 class="print-title">Historique des Cales</h1>
              <div class="print-date">Généré le: ${new Date().toLocaleString('fr-FR')}</div>
            </div>
            
            <div class="filters">
              <div class="filter-row">
                <span class="filter-label">Trié par:</span>
                <span>${sortBy === 'date' ? 'Date' : sortBy === 'assise' ? 'Assise coupelle' : sortBy === 'axe' ? 'Axe coupelle' : 'Référence amortisseur'}</span>
              </div>
              <div class="filter-row">
                <span class="filter-label">Période:</span>
                <span>${
                  dateFilter === 'day' ? '24 dernières heures' : 
                  dateFilter === 'month' ? '30 derniers jours' : 
                  dateFilter === 'year' ? '12 derniers mois' : 
                  dateFilter === 'custom' ? `Personnalisée (${customDate.start || ''} à ${customDate.end || ''})` : 'Tout'
                }</span>
              </div>
              ${assiseFilter ? `
                <div class="filter-row">
                  <span class="filter-label">Filtre assise:</span>
                  <span>${assiseFilter}</span>
                </div>
              ` : ''}
              ${axeFilter ? `
                <div class="filter-row">
                  <span class="filter-label">Filtre axe:</span>
                  <span>${axeFilter}</span>
                </div>
              ` : ''}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Référence amortisseur</th>
                  <th>Assise coupelle</th>
                  <th>Axe coupelle</th>
                  <th>Nom prénom</th>
                  <th>Épaisseur cale</th>
                  <th>Temps activité</th>
                </tr>
              </thead>
              <tbody>
                ${caleHistoryItems.map(item => `
                  <tr>
                    <td>${item.reference_amortisseur || '-'}</td>
                    <td>${item.assise_coupelle || '-'}</td>
                    <td>${item.axe_coupelle || '-'}</td>
                    <td>${item.nom_prenom || '-'}</td>
                    <td>${item.epaisseur_cale || '-'}</td>
                    <td>${
                      item.temps_activite 
                        ? new Date(item.temps_activite).toLocaleString('fr-FR')
                        : '-'
                    }</td>
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

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={printHistory}
          disabled={caleHistoryItems.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                Référence amortisseur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assise coupelle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Axe coupelle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom prénom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Épaisseur cale
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temps activité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {caleHistoryItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.reference_amortisseur || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.assise_coupelle || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.axe_coupelle || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.nom_prenom || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.epaisseur_cale || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.temps_activite 
                    ? new Date(item.temps_activite).toLocaleString('fr-FR') 
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2 no-print">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CaleHistoryList 