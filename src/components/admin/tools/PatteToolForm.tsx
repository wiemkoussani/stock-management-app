'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { PatteTool } from '@/types/admin'
import { validatePatteEmplacements } from '@/lib/validation/toolValidations'

interface PatteToolFormProps {
  onCancel: () => void
  initialData?: PatteTool
  onSuccess?: () => void
}

const PatteToolForm = ({ onCancel, initialData, onSuccess }: PatteToolFormProps) => {
  const [loading, setLoading] = useState(false)
  const [tool, setTool] = useState<Omit<PatteTool, 'id' | 'created_at'>>(initialData || {
    reference_patte_anneau: '',
    reference: '',
    reference_outil_1: null,
    emplacement_outil_1: null,
    reference_outil_2: null,
    emplacement_outil_2: null,
    reference_outil_3: null,
    emplacement_outil_3: null,
    commentaire: null,
    observation: null
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Validate first
      await validatePatteEmplacements({
        ...tool,
        id: initialData?.id || 'new',
        type: 'patte',
        created_at: new Date().toISOString()
      })

      // Then submit
      if (initialData) {
        const { error } = await supabase
          .from('outils_soudage_patte')
          .update(tool)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Outil mis à jour avec succès')
      } else {
        const { error } = await supabase
          .from('outils_soudage_patte')
          .insert([tool])
        if (error) throw error
        toast.success('Outil créé avec succès')
      }
      
      onSuccess?.()
      onCancel()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de validation')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(tool).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key.replace(/_/g, ' ')}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => setTool({ ...tool, [key]: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'En cours...' : initialData ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}

export default PatteToolForm