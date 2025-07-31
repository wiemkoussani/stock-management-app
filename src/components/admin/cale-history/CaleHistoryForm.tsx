'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { CaleHistoryItem } from '@/types/admin'

interface CaleHistoryFormProps {
  initialData?: CaleHistoryItem
  onCancel: () => void
  onSuccess?: () => void
  onUpdate?: (item: CaleHistoryItem) => Promise<void>
  refetch?: () => Promise<void>
}

const CaleHistoryForm = ({ 
  initialData, 
  onCancel, 
  onSuccess, 
  onUpdate,
  refetch 
}: CaleHistoryFormProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<CaleHistoryItem, 'id' | 'user_id'>>({ 
    reference_amortisseur: '',
    assise_coupelle: '',
    axe_coupelle: '',
    nom_prenom: '',
    epaisseur_cale: 0,
    temps_activite: new Date().toISOString()
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        reference_amortisseur: initialData.reference_amortisseur,
        assise_coupelle: initialData.assise_coupelle,
        axe_coupelle: initialData.axe_coupelle,
        nom_prenom: initialData.nom_prenom,
        epaisseur_cale: initialData.epaisseur_cale,
        temps_activite: initialData.temps_activite
      })
    }
  }, [initialData])

  const handleSubmit = async () => {
    if (!formData.reference_amortisseur || !formData.assise_coupelle || !formData.axe_coupelle) {
      toast.error('Les champs "Référence amortisseur", "Assise" et "Axe" sont obligatoires')
      return
    }
  
    setLoading(true)
    try {
      if (initialData?.id) {
        // Mode édition - Mise à jour directe dans Supabase
        const { data, error } = await supabase
          .from('historique_cale')
          .update({
            reference_amortisseur: formData.reference_amortisseur,
            assise_coupelle: formData.assise_coupelle,
            axe_coupelle: formData.axe_coupelle,
            nom_prenom: formData.nom_prenom,
            epaisseur_cale: Number(formData.epaisseur_cale),
            temps_activite: formData.temps_activite
          })
          .eq('id', initialData.id)
          .select()
  
        if (error) throw error
  
        // Optionnel : appeler onUpdate pour la mise à jour optimiste locale
        if (onUpdate && data?.[0]) {
          await onUpdate(data[0])
        }
        
        toast.success('Modification enregistrée avec succès')
      } else {
        // Mode création - reste inchangé
        const { error } = await supabase
          .from('historique_cale')
          .insert([{
            ...formData,
            epaisseur_cale: Number(formData.epaisseur_cale)
          }])
  
        if (error) throw error
        toast.success('Nouvelle cale enregistrée')
      }
  
      if (refetch) await refetch()
      onSuccess?.()
      onCancel()
    } catch (error) {
      console.error('Erreur:', error)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      toast.error(`Erreur lors de l'enregistrement: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'epaisseur_cale' ? Number(value) : value
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Modifier la cale' : 'Ajouter une cale'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Référence amortisseur*
          </label>
          <input
            type="text"
            value={formData.reference_amortisseur}
            onChange={(e) => handleChange('reference_amortisseur', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assise coupelle*
          </label>
          <input
            type="text"
            value={formData.assise_coupelle}
            onChange={(e) => handleChange('assise_coupelle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Axe coupelle*
          </label>
          <input
            type="text"
            value={formData.axe_coupelle}
            onChange={(e) => handleChange('axe_coupelle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Épaisseur (mm)
          </label>
          <input
            type="number"
            value={formData.epaisseur_cale}
            onChange={(e) => handleChange('epaisseur_cale', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="0"
            step="0.1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom/Prénom
          </label>
          <input
            type="text"
            value={formData.nom_prenom}
            onChange={(e) => handleChange('nom_prenom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

export default CaleHistoryForm 