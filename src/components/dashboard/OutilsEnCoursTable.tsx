'use client'

import { OutilEnCours } from '@/types/dashboard'

interface OutilsEnCoursTableProps {
  outils: OutilEnCours[]
  onSelect: (outil: OutilEnCours) => void
  mouvementType: 'entree' | 'sortie'
}

export default function OutilsEnCoursTable({ outils, onSelect, mouvementType }: OutilsEnCoursTableProps) {
  // Show the table for both entree and sortie modes
  if (outils.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucun outil en cours d'utilisation</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-blue-800">
        Outils en cours d'utilisation ({outils.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-blue-200">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 text-left">Référence</th>
              <th className="py-3 px-4 text-left">Outil</th>
              <th className="py-3 px-4 text-left">Emplacement</th>
              <th className="py-3 px-4 text-left">Personne</th>
              <th className="py-3 px-4 text-left">Activité</th>
              <th className="py-3 px-4 text-left">Quantité</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {outils.map((outil) => (
              <tr key={outil.id} className="border-b border-blue-200 hover:bg-blue-50">
                <td className="py-3 px-4 text-sm text-blue-900">{outil.reference}</td>
                <td className="py-3 px-4 text-sm text-blue-900">{outil.reference_outil}</td>
                <td className="py-3 px-4 text-sm text-blue-900">{outil.emplacement}</td>
                <td className="py-3 px-4 text-sm text-blue-900">{outil.nom_prenom_personne}</td>
                <td className="py-3 px-4 text-sm text-blue-900">{outil.activite}</td>
                <td className="py-3 px-4 text-sm text-blue-900">{outil.quantite}</td>
                <td className="py-3 px-4 text-sm text-blue-900">
                  {new Date(outil.date_operation).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onSelect(outil)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    {mouvementType === 'entree' ? 'Retourner' : 'Sélectionner'}
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