import React from 'react'

interface EntryHistoryItem {
  id: string
  reference: string
  reference_outil?: string
  emplacement: string
  nom_prenom_personne: string
  quantite: number
  date_operation: string
}

interface EntryHistoryTableProps {
  history: EntryHistoryItem[]
}

export default function EntryHistoryTable({ history }: EntryHistoryTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (history.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 mb-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Historique des Entrées - Aujourd'hui</h2>
        <div className="text-center py-8 text-blue-600">
          <p>Aucune entrée enregistrée aujourd'hui</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 mb-6 border border-blue-200">
      <h2 className="text-xl font-bold mb-4 text-blue-800">
        Historique des Entrées - Aujourd'hui ({history.length})
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-blue-200/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-900 border-b border-blue-300">
                Heure
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-900 border-b border-blue-300">
                Référence
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-900 border-b border-blue-300">
                Outil
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-900 border-b border-blue-300">
                Emplacement
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-900 border-b border-blue-300">
                Personne
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-blue-900 border-b border-blue-300">
                Quantité
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-blue-100/30 transition-colors">
                <td className="px-4 py-3 text-sm text-blue-900 border-b border-blue-200">
                  {formatDate(item.date_operation)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-blue-900 border-b border-blue-200">
                  {item.reference}
                </td>
                <td className="px-4 py-3 text-sm text-blue-700 border-b border-blue-200">
                  {item.reference_outil || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-blue-700 border-b border-blue-200">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                    {item.emplacement}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-blue-700 border-b border-blue-200">
                  {item.nom_prenom_personne}
                </td>
                <td className="px-4 py-3 text-sm text-blue-700 border-b border-blue-200 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 font-medium">
                    {item.quantite}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-blue-700">
        <p>Total des entrées: <span className="font-bold text-blue-900">{history.length}</span></p>
        <p>Quantité totale: <span className="font-bold text-blue-900">{history.reduce((sum, item) => sum + item.quantite, 0)}</span></p>
      </div>
    </div>
  )
} 