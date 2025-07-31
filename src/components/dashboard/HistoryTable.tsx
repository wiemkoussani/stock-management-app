'use client'

import { HistoryItem } from '../../types/dashboard'
import { FaExclamationTriangle } from 'react-icons/fa'

interface HistoryTableProps {
  history: HistoryItem[]
}

export default function HistoryTable({ history }: HistoryTableProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 mb-6 border border-blue-200">
      <h2 className="text-xl font-bold mb-4 text-blue-800">Historique du jour ({history.length} opérations)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-200">
          <thead className="bg-blue-200/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Heure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Outil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Opérateur</th>
            </tr>
          </thead>
          <tbody className="bg-white/50 divide-y divide-blue-200">
            {history.map((item) => (
              <tr key={item.id} className={item.depassement ? 'bg-blue-100/30' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  {new Date(item.date_operation).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                  {item.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  {item.reference_outil}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  <span className="font-medium">{item.quantite}</span>
                  {item.depassement && (
                    <span className="ml-2 text-blue-600">
                      <FaExclamationTriangle className="inline" />
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.activite === 'corrective' ? (
                    <span className="text-blue-600 font-medium">Correctif</span>
                  ) : (
                    <span className="text-blue-800 font-medium">Préventif</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  {item.nom_prenom_personne}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 