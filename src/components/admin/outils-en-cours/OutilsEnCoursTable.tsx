'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OutilsEnCoursTable() {
  const [outils, setOutils] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOutils = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('outils_en_cours')
          .select('*')
          .order('date_operation', { ascending: false })

        if (error) throw error
        setOutils(data || [])
      } catch (error) {
        console.error('Error fetching tools:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutils()
  }, [])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Outils en Cours</title>
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
              table { 
                width: 100%; 
                border-collapse: collapse;
                margin-top: 15px;
              }
              th { 
                background-color: #ebf4ff; 
                color: #1e40af; 
                padding: 12px 15px; 
                text-align: left;
                font-weight: 500;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border-bottom: 1px solid #d1d5db;
              }
              td { 
                padding: 12px 15px; 
                border-bottom: 1px solid #e5e7eb;
                font-size: 0.875rem;
                color: #4b5563;
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
              <h1 class="print-title">Outils en Cours</h1>
              <div class="print-date">Généré le: ${new Date().toLocaleString('fr-FR')}</div>
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
                ${outils.map(outil => `
                  <tr>
                    <td>${outil.reference || '-'}</td>
                    <td>${outil.reference_outil || '-'}</td>
                    <td>${outil.emplacement || '-'}</td>
                    <td>${outil.nom_prenom_personne || '-'}</td>
                    <td>${outil.activite || '-'}</td>
                    <td>${outil.quantite || '-'}</td>
                    <td>${outil.date_operation ? new Date(outil.date_operation).toLocaleString('fr-FR') : '-'}</td>
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer
        </button>
      </div>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-200">
              {outils.map((outil) => (
                <tr key={outil.id} className="hover:bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.reference || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.reference_outil || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.emplacement || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.nom_prenom_personne || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.activite || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{outil.quantite || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                    {outil.date_operation ? new Date(outil.date_operation).toLocaleString('fr-FR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 