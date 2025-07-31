import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { PatteTool, CoupelleTool } from '@/types/admin'

type ToolType = 'patte' | 'coupelle'
type SearchType = 'reference_amortisseur' | 'reference_composant' | 'reference_outils'

const useAdminTools = (toolType: ToolType) => {
  const [tools, setTools] = useState<(PatteTool | CoupelleTool)[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('reference_amortisseur')

  const fetchTools = async () => {
    setLoading(true)
    try {
      if (toolType === 'patte') {
        let query = supabase
          .from('outils_soudage_patte')
          .select('*')

        if (searchTerm) {
          if (searchType === 'reference_amortisseur') {
            query = query.ilike('reference', `%${searchTerm}%`)
          } else if (searchType === 'reference_composant') {
            query = query.ilike('reference_patte_anneau', `%${searchTerm}%`)
          } else {
            query = query.or(
              `reference_outil_1.ilike.%${searchTerm}%,` +
              `reference_outil_2.ilike.%${searchTerm}%,` +
              `reference_outil_3.ilike.%${searchTerm}%`
            )
          }
        }

        query = query.order('created_at', { ascending: false })
        
        const { data, error } = await query
        
        if (error) throw error
        setTools(data || [])
      } else {
        let query = supabase
          .from('outils_soudage_coupelle')
          .select('*')

        if (searchTerm) {
          if (searchType === 'reference_amortisseur') {
            query = query.ilike('reference_amortisseur', `%${searchTerm}%`)
          } else if (searchType === 'reference_composant') {
            query = query.ilike('reference_coupelle', `%${searchTerm}%`)
          } else {
            query = query.or(
              `assise_coupelle_1.ilike.%${searchTerm}%,` +
              `axe_coupelle_1.ilike.%${searchTerm}%,` +
              `assise_coupelle_2.ilike.%${searchTerm}%,` +
              `axe_coupelle_2.ilike.%${searchTerm}%,` +
              `assise_coupelle_3.ilike.%${searchTerm}%,` +
              `axe_coupelle_3.ilike.%${searchTerm}%`
            )
          }
        }

        query = query.order('created_at', { ascending: false })
        
        const { data, error } = await query
        
        if (error) throw error
        setTools(data || [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des outils')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTool = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet outil ?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from(toolType === 'patte' ? 'outils_soudage_patte' : 'outils_soudage_coupelle')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setTools(tools.filter(tool => tool.id !== id))
      toast.success('Outil supprimé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [toolType, searchTerm, searchType])

  return {
    tools,
    loading,
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    deleteTool,
    refetch: fetchTools
  }
}

export default useAdminTools 