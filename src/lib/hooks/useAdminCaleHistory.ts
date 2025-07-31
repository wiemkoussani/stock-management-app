import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { CaleHistoryItem } from '@/types/admin'

type CaleSortBy = 'date' | 'assise' | 'axe'
type CaleDateFilter = 'custom' | 'day' | 'month' | 'year' | 'all'

const useAdminCaleHistory = () => {
  const [caleHistoryItems, setCaleHistoryItems] = useState<CaleHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<CaleSortBy>('date')
  const [dateFilter, setDateFilter] = useState<CaleDateFilter>('all')
  const [customDate, setCustomDate] = useState<{start?: string, end?: string}>({})
  const [assiseFilter, setAssiseFilter] = useState('')
  const [axeFilter, setAxeFilter] = useState('')

  const fetchCaleHistory = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('historique_cale')
        .select('*')

      // Filtrage par date
      if (dateFilter !== 'all') {
        let fromDate: Date | undefined
        let toDate: Date | undefined

        if (dateFilter === 'custom' && customDate.start && customDate.end) {
          fromDate = new Date(customDate.start)
          toDate = new Date(customDate.end)
        } else {
          const now = new Date()
          fromDate = new Date()

          if (dateFilter === 'day') {
            fromDate.setDate(now.getDate() - 1)
          } else if (dateFilter === 'month') {
            fromDate.setMonth(now.getMonth() - 1)
          } else if (dateFilter === 'year') {
            fromDate.setFullYear(now.getFullYear() - 1)
          }
        }

        if (fromDate) query = query.gte('temps_activite', fromDate.toISOString())
        if (toDate) query = query.lte('temps_activite', toDate.toISOString())
      }

      // Filtrage par assise/axe
      if (assiseFilter) query = query.ilike('assise_coupelle', `%${assiseFilter}%`)
      if (axeFilter) query = query.ilike('axe_coupelle', `%${axeFilter}%`)

      // Tri
      if (sortBy === 'date') {
        query = query.order('temps_activite', { ascending: false })
      } else if (sortBy === 'assise') {
        query = query.order('assise_coupelle', { ascending: true })
      } else if (sortBy === 'axe') {
        query = query.order('axe_coupelle', { ascending: true })
      }

      const { data, error } = await query

      if (error) throw error
      setCaleHistoryItems(data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des câles')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateCaleHistoryItem = async (item: CaleHistoryItem) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('historique_cale')
        .update({
          assise_coupelle: item.assise_coupelle,
          axe_coupelle: item.axe_coupelle,
          nom_prenom: item.nom_prenom,
          epaisseur_cale: item.epaisseur_cale,
          temps_activite: item.temps_activite
        })
        .eq('id', item.id)
        .select()

      if (error) throw error

      // Mise à jour optimiste
      setCaleHistoryItems(prev => 
        prev.map(i => i.id === item.id ? data[0] : i)
      )

      toast.success('Cale mise à jour avec succès')
      return data[0]
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
      console.error(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteCaleHistoryItem = async (id: string) => {
    if (!confirm('Supprimer cette entrée ?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('historique_cale')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCaleHistoryItems(prev => prev.filter(item => item.id !== id))
      toast.success('Entrée supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaleHistory()
  }, [sortBy, dateFilter, customDate, assiseFilter, axeFilter])

  return {
    caleHistoryItems,
    loading,
    caleSortBy: sortBy,          // Garde le nom interne mais l'alias comme attendu
    setCaleSortBy: setSortBy,
    caleDateFilter: dateFilter,
    setCaleDateFilter: setDateFilter,
    caleCustomDate: customDate,
    setCaleCustomDate: setCustomDate,
    caleAssiseFilter: assiseFilter,
    setCaleAssiseFilter: setAssiseFilter,
    caleAxeFilter: axeFilter,
    setCaleAxeFilter: setAxeFilter,
    deleteCaleHistoryItem,
    refetch: fetchCaleHistory
  }
}   

export default useAdminCaleHistory   