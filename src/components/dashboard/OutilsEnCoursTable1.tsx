'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Define the interface for the component props
interface OutilsEnCoursTable1Props {
  outils: any[]
  onSelect: (outil: any) => void
  mouvementType: 'entree' | 'sortie'
}

export default function OutilsEnCoursTable1({ outils, onSelect, mouvementType }: OutilsEnCoursTable1Props) {
  const [localOutils, setLocalOutils] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If outils are passed as props, use them instead of fetching
    if (outils && outils.length > 0) {
      setLocalOutils(outils)
      setLoading(false)
      return
    }

    const fetchOutils = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('outils_en_cours')
          .select('*')
          .order('date_operation', { ascending: false })

        if (error) throw error
        setLocalOutils(data || [])
      } catch (error) {
        console.error('Error fetching tools:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutils()
  }, [outils])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Use localOutils which can be either from props or fetched data
  const outilsToDisplay = outils && outils.length > 0 ? outils : localOutils

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Outil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Emplacement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Personne</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Activité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Date</th>
              {mouvementType === 'sortie' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-200">
            {outilsToDisplay.map((outil) => (
              <tr key={outil.id} className="hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.reference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.reference_outil}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.emplacement}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.nom_prenom_personne}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.activite}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.quantite}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {new Date(outil.date_operation).toLocaleString()}
                </td>
                {mouvementType === 'sortie' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                    <button
                      onClick={() => onSelect(outil)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Sélectionner
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 