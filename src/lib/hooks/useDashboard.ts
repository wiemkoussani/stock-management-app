import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import SeuilModal from '../../app/dashboard/SeuilModal'
import OutilCritiqueModal from '../../app/dashboard/OutilCritiqueModal'
import { 
  CoupelleItem, 
  PatteItem, 
  CaleItem, 
  SelectedItem, 
  HistoryItem,
  EntryHistoryItem,
  EntryItem,
  SearchType,
  MouvementType,
  OutilEnCours
} from '@/types/dashboard'
interface SeuilModalData {
  reference: string
  reference_outil: string
  emplacement: string | null
  quantite: number
  userId: string
  nomAffichage: string
  now: string
  quantiteActuelle: number
}

interface OutilCritiqueData {
  reference_outil: string
}

export default function useDashboard() {
  const [searchType, setSearchType] = useState<SearchType>('reference_amortisseur')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [quantite, setQuantite] = useState<number>(0)
  const [caleEpaisseur, setCaleEpaisseur] = useState<number>(0)
  const [coupelleItems, setCoupelleItems] = useState<CoupelleItem[]>([])
  const [existingCalais, setExistingCalais] = useState<CaleItem[]>([])
  const [patteItems, setPatteItems] = useState<PatteItem[]>([])
  const [mouvementType, setMouvementType] = useState<MouvementType>('sortie')
  const [showEntreeModal, setShowEntreeModal] = useState<boolean>(false)
  const [currentEntreeItem, setCurrentEntreeItem] = useState<EntryItem | null>(null)
  const [todayEntryHistory, setTodayEntryHistory] = useState<EntryHistoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showCaleModal, setShowCaleModal] = useState<boolean>(false)
  const [todayHistory, setTodayHistory] = useState<HistoryItem[]>([])
  const [currentCaleItem, setCurrentCaleItem] = useState<{
    assise: string
    axe: string | null
    outilIndex: number
    coupelleId: string
  } | null>(null)
  const [outilsEnCours, setOutilsEnCours] = useState<OutilEnCours[]>([])
  const [showOutilWarning, setShowOutilWarning] = useState<boolean>(false)
  const [warningMessage, setWarningMessage] = useState<string>('')
  const [showSeuilModal, setShowSeuilModal] = useState<boolean>(false)
const [seuilModalData, setSeuilModalData] = useState<SeuilModalData | null>(null)
const [showOutilCritiqueModal, setShowOutilCritiqueModal] = useState<boolean>(false)
const [outilsCritiquesData, setOutilsCritiquesData] = useState<OutilCritiqueData[]>([])
const [isNettoyageConfirmed, setIsNettoyageConfirmed] = useState<boolean>(false)
const [pendingValidationItems, setPendingValidationItems] = useState<SelectedItem[]>([])
const [showCaleExistanteModal, setShowCaleExistanteModal] = useState<boolean>(false)
const [caleExistanteData, setCaleExistanteData] = useState<{
  epaisseur: number
  assise: string
  axe: string
  coupelleId: string
  outilIndex: number
} | null>(null)
const handleCaleExistanteConfirmation = () => {
  if (!caleExistanteData) return

  // Sélectionner directement l'item
  setSelectedItems(prev => [
    ...prev,
    { 
      id: caleExistanteData.coupelleId, 
      type: 'coupelle', 
      outilIndex: caleExistanteData.outilIndex, 
      quantite: quantite || 0, 
      assise: caleExistanteData.assise, 
      axe: caleExistanteData.axe 
    }
  ])

  // Fermer la modale
  setShowCaleExistanteModal(false)
  setCaleExistanteData(null)
}

const handleCaleExistanteCancel = () => {
  setShowCaleExistanteModal(false)
  setCaleExistanteData(null)
}

// 🆕 NOUVELLE FONCTION DE CONFIRMATION SEUIL
const handleSeuilConfirmation = async () => {
  if (!seuilModalData || !isNettoyageConfirmed) return

  try {
    const { reference, reference_outil, emplacement, quantite, userId, nomAffichage, now } = seuilModalData

    // Ajouter à outils_en_cours
    const { error: enCoursError } = await supabase
      .from('outils_en_cours')
      .insert({
        reference,
        reference_outil,
        emplacement,
        nom_prenom_personne: nomAffichage,
        activite: 'corrective',
        quantite: quantite,
        created_by: userId,
        date_operation: now
      })

    if (enCoursError) throw enCoursError

    // Maintenance préventive + corrective
    await supabase
      .from('historique')
      .insert({
        reference,
        reference_outil,
        emplacement,
        nom_prenom_personne: nomAffichage,
        activite: 'preventive',
        quantite: 0,
        created_by: userId,
        date_operation: now
      })

    await supabase
      .from('historique')
      .insert({
        reference,
        reference_outil,
        emplacement,
        nom_prenom_personne: nomAffichage,
        activite: 'corrective',
        quantite: quantite,
        created_by: userId,
        date_operation: now
      })

    toast.success(`Sortie + Dépassement seuil validé : ${reference_outil}`, { icon: '⚠️' })

  } catch (error) {
    console.error('Erreur confirmation seuil:', error)
    toast.error(`Erreur : ${error instanceof Error ? error.message : 'Inconnue'}`)
  } finally {
    setShowSeuilModal(false)
    setSeuilModalData(null)
    setIsNettoyageConfirmed(false)
  }
}


// 🆕 NOUVELLE FONCTION DE CONFIRMATION OUTIL CRITIQUE
const handleOutilCritiqueConfirmation = async () => {
  if (!isNettoyageConfirmed || pendingValidationItems.length === 0) return

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      toast.error("Erreur d'authentification")
      return
    }

    const nomAffichage = user.user_metadata?.full_name || 
                        user.user_metadata?.name ||
                        (user.email ? user.email.split('@')[0] : null) || 
                        'Utilisateur'

    const now = new Date().toISOString()
    let successCount = 0
    let errorCount = 0

    // Traitement des items en attente
    for (const item of pendingValidationItems) {
      if (item.type === 'patte') {
        const patte = patteItems.find(p => p.id === item.id)
        if (!patte) continue

        if (item.outilIndex) {
          const reference = patte.reference
          const reference_outil = patte[`reference_outil_${item.outilIndex}` as keyof PatteItem] as string
          const emplacement = patte[`emplacement_outil_${item.outilIndex}` as keyof PatteItem] as string

          if (!reference || !reference_outil) continue

          const result = await insertSortieHistorique(
            reference,
            reference_outil,
            emplacement,
            item.quantite,
            user.id,
            nomAffichage,
            now
          )

          if (result.success) {
            successCount++
          } else {
            errorCount++
            toast.error(result.message)
          }
        } else {
          for (const num of [1, 2, 3]) {
            const reference_outil = patte[`reference_outil_${num}` as keyof PatteItem] as string
            const emplacement = patte[`emplacement_outil_${num}` as keyof PatteItem] as string
            
            if (!reference_outil) continue

            const result = await insertSortieHistorique(
              patte.reference,
              reference_outil,
              emplacement,
              item.quantite,
              user.id,
              nomAffichage,
              now
            )

            if (result.success) {
              successCount++
            } else {
              errorCount++
              toast.error(result.message)
            }
          }
        }
      } else if (item.type === 'coupelle') {
        const coupelle = coupelleItems.find(c => c.id === item.id)
        if (!coupelle) continue

        const reference = coupelle.reference_amortisseur
        
        if (!item.outilIndex) {
          for (const num of [1, 2, 3]) {
            const assise = coupelle[`assise_coupelle_${num}` as keyof CoupelleItem] as string
            const axe = coupelle[`axe_coupelle_${num}` as keyof CoupelleItem] as string
            
            if (assise) {
              const result = await insertSortieHistorique(
                reference,
                assise,
                coupelle[`emp_ass_${num}` as keyof CoupelleItem] as string,
                item.quantite,
                user.id,
                nomAffichage,
                now
              )
              if (result.success) successCount++
              else errorCount++
            }

            if (axe) {
              const result = await insertSortieHistorique(
                reference,
                axe,
                coupelle[`emp_axe_${num}` as keyof CoupelleItem] as string,
                item.quantite,
                user.id,
                nomAffichage,
                now
              )
              if (result.success) successCount++
              else errorCount++
            }
          }
          continue
        }

        if (item.assise) {
          const reference_outil = coupelle[`assise_coupelle_${item.outilIndex}` as keyof CoupelleItem] as string
          if (reference_outil) {
            const result = await insertSortieHistorique(
              reference,
              reference_outil,
              coupelle[`emp_ass_${item.outilIndex}` as keyof CoupelleItem] as string,
              item.quantite,
              user.id,
              nomAffichage,
              now
            )
            if (result.success) successCount++
            else errorCount++
          }
        }

        if (item.axe) {
          const reference_outil = coupelle[`axe_coupelle_${item.outilIndex}` as keyof CoupelleItem] as string
          if (reference_outil) {
            const result = await insertSortieHistorique(
              reference,
              reference_outil,
              coupelle[`emp_axe_${item.outilIndex}` as keyof CoupelleItem] as string,
              item.quantite,
              user.id,
              nomAffichage,
              now
            )
            if (result.success) successCount++
            else errorCount++
          }
        }
      }
    }

    // Nettoyage et rechargement
    setSelectedItems([])
    setCoupelleItems([])
    setPatteItems([])
    setExistingCalais([])
    setSearchTerm('')
    await loadTodayHistory()
    await loadOutilsEnCours()

    if (successCount > 0) toast.success(`${successCount} sortie(s) validée(s)`)
    if (errorCount > 0) toast.error(`${errorCount} erreur(s)`)

  } catch (error) {
    console.error("Erreur:", error)
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  } finally {
    setShowOutilCritiqueModal(false)
    setOutilsCritiquesData([])
    setIsNettoyageConfirmed(false)
    setPendingValidationItems([])
  }
}

  const loadTodayHistory = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('historique')
        .select('*')
        .gte('date_operation', `${today}T00:00:00`)
        .lte('date_operation', `${today}T23:59:59`)
        .order('date_operation', { ascending: false })

      if (error) throw error
      setTodayHistory(data || [])
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    }
  }

  const loadTodayEntryHistory = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('historique_entree')
        .select('*')
        .gte('date_operation', `${today}T00:00:00`)
        .lte('date_operation', `${today}T23:59:59`)
        .order('date_operation', { ascending: false })

      if (error) throw error
      setTodayEntryHistory(data || [])
    } catch (error) {
      console.error('Erreur chargement historique entrée:', error)
    }
  }
  const checkIfInStock = async (reference: string, reference_outil: string): Promise<boolean> => {
    try {
      // Vérifier si l'outil est dans outils_en_cours (déjà sorti)
      const { data: outilEnCours, error: enCoursError } = await supabase
        .from('outils_en_cours')
        .select('*')
        .eq('reference', reference)
        .eq('reference_outil', reference_outil);
  
      if (enCoursError) throw enCoursError;
  
      // Si l'outil est dans outils_en_cours, il n'est PAS disponible pour sortie
      if (outilEnCours && outilEnCours.length > 0) {
        return false;
      }
  
      // Vérifier si l'outil existe dans outils_soudage_patte
      const { data: patteData, error: patteError } = await supabase
        .from('outils_soudage_patte')
        .select('*')
        .eq('reference', reference)
        .or(`reference_outil_1.eq.${reference_outil},reference_outil_2.eq.${reference_outil},reference_outil_3.eq.${reference_outil}`);
  
      if (patteError) throw patteError;
  
      if (patteData && patteData.length > 0) {
        return true;
      }
  
      // Vérifier si l'outil existe dans outils_soudage_coupelle
      const { data: coupelleData, error: coupelleError } = await supabase
        .from('outils_soudage_coupelle')
        .select('*')
        .eq('reference_amortisseur', reference)
        .or(`assise_coupelle_1.eq.${reference_outil},axe_coupelle_1.eq.${reference_outil},assise_coupelle_2.eq.${reference_outil},axe_coupelle_2.eq.${reference_outil},assise_coupelle_3.eq.${reference_outil},axe_coupelle_3.eq.${reference_outil}`);
  
      if (coupelleError) throw coupelleError;
  
      return coupelleData && coupelleData.length > 0;
  
    } catch (error) {
      console.error('Erreur vérification stock:', error);
      return false;
    }
  };
  const loadOutilsEnCours = async () => {
    try {
      const { data, error } = await supabase
        .from('outils_en_cours')
        .select('*')
        .order('date_operation', { ascending: false })

      if (error) throw error
      setOutilsEnCours(data || [])
    } catch (error) {
      console.error('Erreur chargement outils en cours:', error)
    }
  }

  
  // Fonction handleSearch corrigée
  const handleSearch = async (term: string) => {
    setIsLoading(true)
    setSearchTerm(term) // Mettre à jour le searchTerm avec le paramètre reçu
  
    try {
      if (!term.trim()) {
        setPatteItems([])
        setCoupelleItems([])
        setExistingCalais([])
        return
      }
  
      // Recherche des pattes dans outils_soudage_patte
      const { data: patteData, error: patteError } = await supabase
        .from('outils_soudage_patte')
        .select('*')
        .ilike('reference', `%${term}%`)
  
      if (patteError) throw patteError
  
      // Recherche des coupelles dans outils_soudage_coupelle
      const { data: coupelleData, error: coupelleError } = await supabase
        .from('outils_soudage_coupelle')
        .select('*')
        .ilike('reference_amortisseur', `%${term}%`)
  
      if (coupelleError) throw coupelleError
  
      // Vérification de la disponibilité pour les pattes
      const patteItemsWithStock = await Promise.all(
        (patteData || []).map(async (patte) => {
          const stockPromises = [1, 2, 3].map(async (num) => {
            const referenceOutil = patte[`reference_outil_${num}`]
            if (!referenceOutil) return false
            
            try {
              return await checkIfInStock(patte.reference, referenceOutil)
            } catch (error) {
              console.warn(`Erreur vérification stock pour ${referenceOutil}:`, error)
              return false
            }
          })
          
          try {
            const stockResults = await Promise.all(stockPromises)
            return {
              ...patte,
              stock_outil_1: stockResults[0],
              stock_outil_2: stockResults[1], 
              stock_outil_3: stockResults[2]
            }
          } catch (error) {
            console.warn(`Erreur lors de la vérification du stock pour la patte ${patte.reference}:`, error)
            return {
              ...patte,
              stock_outil_1: false,
              stock_outil_2: false,
              stock_outil_3: false
            }
          }
        })
      )
  
      // Vérification de la disponibilité pour les coupelles
      const coupelleItemsWithStock = await Promise.all(
        (coupelleData || []).map(async (coupelle) => {
          try {
            const stockPromises = [1, 2, 3].map(async (num) => {
              const assise = coupelle[`assise_coupelle_${num}`]
              const axe = coupelle[`axe_coupelle_${num}`]
              
              const promiseAssise = assise ? 
                checkIfInStock(coupelle.reference_amortisseur, assise).catch(() => false) : 
                Promise.resolve(false)
                
              const promiseAxe = axe ? 
                checkIfInStock(coupelle.reference_amortisseur, axe).catch(() => false) : 
                Promise.resolve(false)
              
              const [stockAssise, stockAxe] = await Promise.all([promiseAssise, promiseAxe])
              
              return {
                stockAssise,
                stockAxe
              }
            })
            
            const stockResults = await Promise.all(stockPromises)
            
            return {
              ...coupelle,
              stock_assise_1: stockResults[0]?.stockAssise || false,
              stock_axe_1: stockResults[0]?.stockAxe || false,
              stock_assise_2: stockResults[1]?.stockAssise || false,
              stock_axe_2: stockResults[1]?.stockAxe || false,
              stock_assise_3: stockResults[2]?.stockAssise || false,
              stock_axe_3: stockResults[2]?.stockAxe || false
            }
          } catch (error) {
            console.warn(`Erreur lors de la vérification du stock pour la coupelle ${coupelle.reference_amortisseur}:`, error)
            return {
              ...coupelle,
              stock_assise_1: false,
              stock_axe_1: false,
              stock_assise_2: false,
              stock_axe_2: false,
              stock_assise_3: false,
              stock_axe_3: false
            }
          }
        })
      )
  
      setPatteItems(patteItemsWithStock || [])
      setCoupelleItems(coupelleItemsWithStock || [])
  
      // Mise à jour des calais existants
      const allReferences = [
        ...(patteData || []).map(p => p.reference),
        ...(coupelleData || []).map(c => c.reference_amortisseur)
      ]
      
      if (allReferences.length > 0) {
        try {
          const { data: existingData, error: existingError } = await supabase
            .from('historique')
            .select('reference')
            .in('reference', allReferences)
            .order('date_operation', { ascending: false })
  
          if (existingError) {
            console.warn('Erreur lors de la récupération des calais existants:', existingError)
            setExistingCalais([])
          } else {
            const uniqueReferences = [...new Set((existingData || []).map(item => item.reference))]
            setExistingCalais(uniqueReferences)
          }
        } catch (error) {
          console.warn('Erreur lors de la récupération des calais existants:', error)
          setExistingCalais([])
        }
      } else {
        setExistingCalais([])
      }
  
    } catch (error) {
      console.error('Erreur recherche:', error)
      toast.error('Erreur lors de la recherche')
      
      setPatteItems([])
      setCoupelleItems([])
      setExistingCalais([])
    } finally {
      setIsLoading(false)
    }
  } 
  // ✅ AJOUT : Fonction wrapper pour compatibilité (si nécessaire ailleurs)
  const handleSearchWrapper = () => {
    handleSearch(searchTerm)
  } 
  const toggleItemSelection = async (
    id: string, 
    type: 'coupelle' | 'patte', 
    outilIndex?: number, 
    assise?: string | null, 
    axe?: string | null
  ) => {
    if (mouvementType === 'entree') {
      // MODE ENTRÉE : Sélectionner depuis outils_en_cours
      const outilEnCours = outilsEnCours.find(outil => outil.id === id)
      if (!outilEnCours) {
        toast.error('Outil non trouvé dans les outils en cours')
        return
      }
  
      setCurrentEntreeItem({
        id: outilEnCours.id,
        reference: outilEnCours.reference,
        reference_outil: outilEnCours.reference_outil,
        emplacement: outilEnCours.emplacement
      })
      setQuantite(outilEnCours.quantite)
      setShowEntreeModal(true)
      return
    }
  
    // MODE SORTIE : Vérifier disponibilité avant sélection
    let reference = ''
    let reference_outil = ''
    
    if (type === 'patte') {
      const patte = patteItems.find(p => p.id === id)
      if (!patte) return
      
      reference = patte.reference
      if (outilIndex) {
        reference_outil = patte[`reference_outil_${outilIndex}` as keyof PatteItem] as string || ''
      }
    } else if (type === 'coupelle') {
      const coupelle = coupelleItems.find(c => c.id === id)
      if (!coupelle) return
      
      reference = coupelle.reference_amortisseur
      if (outilIndex && assise) {
        reference_outil = coupelle[`assise_coupelle_${outilIndex}` as keyof CoupelleItem] as string || ''
      } else if (outilIndex && axe) {
        reference_outil = coupelle[`axe_coupelle_${outilIndex}` as keyof CoupelleItem] as string || ''
      }
    }
  
    // Vérifier si l'outil est disponible pour sortie
    if (reference_outil) {
      try {
        const isAvailable = await checkIfInStock(reference, reference_outil)
        if (!isAvailable) {
          toast.error(`L'outil ${reference_outil} n'est pas disponible (déjà sorti )`)
          return
        }
      } catch (error) {
        console.error('Erreur vérification stock:', error)
        toast.error('Erreur lors de la vérification du stock')
        return
      }
    }
  
    // 🆕 LOGIQUE DE GESTION DES CALES - VÉRIFICATION IMMÉDIATE
    if (type === 'coupelle' && assise && axe) {
      console.log('🔍 Vérification cale pour:', { assise, axe })
      
      // Vérifier d'abord si déjà sélectionné pour désélectionner
      const caleSelected = selectedItems.some(item => 
        item.id === id && 
        item.type === type && 
        item.outilIndex === outilIndex &&
        item.assise === assise &&
        item.axe === axe
      )
  
      if (caleSelected) {
        console.log('📤 Désélection de la cale')
        setSelectedItems(prev => prev.filter(item => 
          !(item.id === id && 
            item.type === type && 
            item.outilIndex === outilIndex &&
            item.assise === assise &&
            item.axe === axe)
        ))
        return
      }
  
      // 🎯 VÉRIFICATION IMMÉDIATE DANS LA BASE DE DONNÉES
      try {
        const { data: caleExistante, error } = await supabase
          .from('historique_cale')
          .select('epaisseur_cale')
          .eq('assise_coupelle', assise)
          .eq('axe_coupelle', axe)
          .limit(1)
  
        if (error) {
          console.error('❌ Erreur requête cale:', error)
          throw error
        }
  
        console.log('📊 Résultat DB cale:', caleExistante)
  
        if (caleExistante && caleExistante.length > 0) {
          console.log('✅ Cale existante trouvée, ouverture modale')
          // 🎯 CALE EXISTE DÉJÀ - AFFICHER LA MODALE IMMÉDIATEMENT
          setCaleExistanteData({
            epaisseur: caleExistante[0].epaisseur_cale,
            assise,
            axe,
            coupelleId: id,
            outilIndex: outilIndex || 1
          })
          setShowCaleExistanteModal(true)
          return
        } else {
          console.log('❌ Cale NON trouvée, ouverture interface saisie')
          // 🆕 CALE N'EXISTE PAS - OUVRIR L'INTERFACE DE SAISIE
          setCurrentCaleItem({
            assise,
            axe,
            outilIndex: outilIndex || 1,
            coupelleId: id
          })
          setShowCaleModal(true)
          return
        }
      } catch (error) {
        console.error('❌ Erreur vérification cale:', error)
        toast.error('Erreur lors de la vérification de la cale')
        return
      }
    }
  
    // Reste de la logique de sélection pour les autres cas
    setSelectedItems(prev => {
      if (type === 'patte') {
        if (outilIndex === undefined) {
          if (prev.some(item => item.id === id && item.type === type && item.outilIndex === undefined)) {
            return prev.filter(item => !(item.id === id && item.type === type))
          }
          return [
            ...prev.filter(item => !(item.id === id && item.type === type)),
            { id, type, quantite: quantite || 1 }
          ]
        }
        
        const existingIndex = prev.findIndex(item => 
          item.id === id && item.type === type && item.outilIndex === outilIndex
        )
  
        if (existingIndex >= 0) {
          return prev.filter((_, index) => index !== existingIndex)
        } else {
          return [...prev, { 
            id, 
            type, 
            outilIndex, 
            quantite: quantite || 1 
          }]
        }
      } else {
        if (outilIndex === undefined) {
          if (prev.some(item => item.id === id && item.type === type && item.outilIndex === undefined)) {
            return prev.filter(item => !(item.id === id && item.type === type))
          }
          return [
            ...prev.filter(item => !(item.id === id && item.type === type)),
            { id, type, quantite: quantite || 1 }
          ]
        }
  
        if (assise && !axe) {
          const existingIndex = prev.findIndex(item => 
            item.id === id && 
            item.type === type && 
            item.outilIndex === outilIndex &&
            item.assise === assise &&
            item.axe === null
          )
  
          if (existingIndex >= 0) {
            return prev.filter((_, index) => index !== existingIndex)
          } else {
            return [...prev, { 
              id, 
              type, 
              outilIndex, 
              quantite: quantite || 1, 
              assise, 
              axe: null 
            }]
          }
        }
  
        if (axe && !assise) {
          const existingIndex = prev.findIndex(item => 
            item.id === id && 
            item.type === type && 
            item.outilIndex === outilIndex &&
            item.assise === null &&
            item.axe === axe
          )
  
          if (existingIndex >= 0) {
            return prev.filter((_, index) => index !== existingIndex)
          } else {
            return [...prev, { 
              id, 
              type, 
              outilIndex, 
              quantite: quantite || 1, 
              assise: null, 
              axe 
            }]
          }
        }
      }
      return prev
    })
  } 

  const handleSelectOutilEnCours = async (outil: OutilEnCours) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error("Erreur d'authentification")
        return
      }

      setCurrentEntreeItem({
        id: outil.id,
        reference: outil.reference,
        reference_outil: outil.reference_outil,
        emplacement: outil.emplacement
      })
      setQuantite(outil.quantite)
      setShowEntreeModal(true)
    } catch (error) {
      console.error("Erreur sélection outil:", error)
      toast.error("Erreur lors de la sélection")
    }
  }

  
  const isItemSelected = (id: string, type: 'coupelle' | 'patte', outilIndex?: number, assise?: string | null, axe?: string | null) => {
    if (type === 'patte') {
      return selectedItems.some(item => 
        item.id === id && 
        item.type === type && 
        (outilIndex === undefined || item.outilIndex === outilIndex)
      )
    } else {
      if (outilIndex === undefined) {
        return selectedItems.some(item => 
          item.id === id && 
          item.type === type && 
          item.outilIndex === undefined
        )
      }

      if (assise && axe) {
        return selectedItems.some(item => 
          item.id === id && 
          item.type === type && 
          item.outilIndex === outilIndex &&
          item.assise === assise &&
          item.axe === axe
        )
      }

      if (assise && !axe) {
        return selectedItems.some(item => 
          item.id === id && 
          item.type === type && 
          item.outilIndex === outilIndex &&
          item.assise === assise &&
          item.axe === null
        )
      }

      if (axe && !assise) {
        return selectedItems.some(item => 
          item.id === id && 
          item.type === type && 
          item.outilIndex === outilIndex &&
          item.assise === null &&
          item.axe === axe
        )
      }

      return false
    }
  }

  const getItemQuantite = (id: string, type: 'coupelle' | 'patte', outilIndex?: number) => {
    const item = selectedItems.find(i => 
      i.id === id && 
      i.type === type && 
      i.outilIndex === outilIndex
    )
    return item ? item.quantite : quantite
  }

  const updateQuantite = (id: string, type: 'coupelle' | 'patte', outilIndex: number | undefined, newQuantite: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === id && item.type === type && item.outilIndex === outilIndex
          ? { ...item, quantite: newQuantite }
          : item
      )
    )
  }

  const handleCaleConfirmation = async (epaisseur: number) => {
    if (!currentCaleItem) return
  
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error("Erreur d'authentification")
        return
      }
  
      const nomAffichage = user.user_metadata?.full_name || 
                          user.user_metadata?.name ||
                          (user.email ? user.email.split('@')[0] : null) || 
                          'Utilisateur'
  
      // Récupérer la référence amortisseur depuis la coupelle correspondante
      const coupelle = coupelleItems.find(c => c.id === currentCaleItem.coupelleId)
      if (!coupelle) {
        toast.error('Coupelle non trouvée')
        return
      }
  
      // Insérer la nouvelle cale
      const { error } = await supabase
        .from('historique_cale')
        .insert({
          reference_amortisseur: coupelle.reference_amortisseur,
          assise_coupelle: currentCaleItem.assise,
          axe_coupelle: currentCaleItem.axe,
          epaisseur_cale: epaisseur,
          nom_prenom: nomAffichage,
          user_id: user.id,
          temps_activite: new Date().toISOString()
        })
  
      if (error) throw error
  
      // Mettre à jour les cales existantes localement
      setExistingCalais(prev => [...prev, {
        reference_amortisseur: coupelle.reference_amortisseur,
        assise_coupelle: currentCaleItem.assise,
        axe_coupelle: currentCaleItem.axe,
        epaisseur_cale: epaisseur
      }])
  
      // Ajouter l'item aux éléments sélectionnés
      setSelectedItems(prev => [
        ...prev,
        { 
          id: currentCaleItem.coupelleId,
          type: 'coupelle',
          outilIndex: currentCaleItem.outilIndex,
          quantite: quantite || 1,
          assise: currentCaleItem.assise,
          axe: currentCaleItem.axe
        }
      ])
  
      toast.success(`Cale enregistrée: ${currentCaleItem.assise} + ${currentCaleItem.axe} (${epaisseur}mm)`)
  
    } catch (error) {
      console.error("Erreur cale:", error)
      toast.error(`Échec ajout cale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setShowCaleModal(false)
      setCurrentCaleItem(null)
    }
  } 

  const insertSortieHistorique = async (
    reference: string,
    reference_outil: string,
    emplacement: string | null,
    quantite: number,
    userId: string,
    nomAffichage: string,
    now: string
  ) => {
    try {
      // 1. Vérifier que l'outil n'est pas déjà sorti
      const { data: outilEnCours, error: checkError } = await supabase
        .from('outils_en_cours')
        .select('*')
        .eq('reference', reference)
        .eq('reference_outil', reference_outil)
  
      if (checkError) throw checkError
  
      if (outilEnCours && outilEnCours.length > 0) {
        return {
          success: false,
          message: `Outil ${reference_outil} déjà en cours d'utilisation`,
          depassement: false
        }
      }
  
      // 2. Vérifier le seuil dans l'historique
      const { data, error: histError } = await supabase
        .from('historique')
        .select('quantite')
        .eq('reference', reference)
        .eq('reference_outil', reference_outil)
        .order('date_operation', { ascending: false })
        .limit(1)
  
      if (histError) throw histError
  
      const quantiteActuelle = data?.[0]?.quantite ?? 0
      const depassement = quantiteActuelle + quantite > 2500
  
      // 🆕 SI DÉPASSEMENT : OUVRIR LA MODALE AU LIEU DE TRAITER DIRECTEMENT
      if (depassement) {
        setSeuilModalData({
          reference,
          reference_outil,
          emplacement,
          quantite,
          userId,
          nomAffichage,
          now,
          quantiteActuelle
        })
        setShowSeuilModal(true)
        
        return {
          success: false,
          message: `Dépassement détecté pour ${reference_outil}`,
          depassement: true,
          requiresConfirmation: true
        }
      }
  
      // 3. Traitement normal (pas de dépassement)
      const { error: enCoursError } = await supabase
        .from('outils_en_cours')
        .insert({
          reference,
          reference_outil,
          emplacement,
          nom_prenom_personne: nomAffichage,
          activite: 'corrective',
          quantite: quantite,
          created_by: userId,
          date_operation: now
        })
  
      if (enCoursError) throw enCoursError
  
      await supabase
        .from('historique')
        .insert({
          reference,
          reference_outil,
          emplacement,
          nom_prenom_personne: nomAffichage,
          activite: 'corrective',
          quantite: quantite,
          created_by: userId,
          date_operation: now
        })
  
      return {
        success: true,
        message: `Sortie enregistrée : ${reference_outil} (+${quantite})`,
        depassement: false
      }
  
    } catch (error) {
      console.error('Erreur sortie:', error)
      return {
        success: false,
        message: `Erreur sortie : ${error instanceof Error ? error.message : 'Inconnue'}`,
        depassement: false
      }
    }
  }
  const handleEntreeConfirmation = async () => {
    if (!currentEntreeItem) return
  
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error("Erreur d'authentification")
        return
      }
  
      const nomAffichage = user.user_metadata?.full_name || 
                          user.user_metadata?.name ||
                          (user.email ? user.email.split('@')[0] : null) || 
                          'Utilisateur'
  
      // 1. ENTRÉE : Supprimer de outils_en_cours
      const { error: deleteError } = await supabase
        .from('outils_en_cours')
        .delete()
        .eq('id', currentEntreeItem.id)
  
      if (deleteError) throw deleteError
  
      // 2. Ajouter à l'historique d'entrée
      const { error: historyError } = await supabase
        .from('historique_entree')
        .insert({
          reference: currentEntreeItem.reference,
          reference_outil: currentEntreeItem.reference_outil,
          emplacement: currentEntreeItem.emplacement,
          nom_prenom_personne: nomAffichage,
          quantite: quantite || 1,
          created_by: user.id
        })
  
      if (historyError) throw historyError
  
      toast.success(`Entrée enregistrée: ${currentEntreeItem.reference_outil || currentEntreeItem.reference}`)
      
      // 3. ✅ FORCER LE RECHARGEMENT IMMÉDIAT
      await Promise.all([
        loadOutilsEnCours(),
        loadTodayEntryHistory()
      ])
  
    } catch (error) {
      console.error("Erreur entrée:", error)
      toast.error(`Échec enregistrement entrée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      // 4. Nettoyer les états APRÈS le rechargement
      setShowEntreeModal(false)
      setCurrentEntreeItem(null)
      setQuantite(0)
    }
  }
  
  const handleValidation = async () => {
    if (selectedItems.length === 0) {
      toast.error('Veuillez sélectionner au moins un élément')
      return
    }
    
    const invalidItems = selectedItems.filter(item => item.quantite <= 0)
    if (invalidItems.length > 0) {
      toast.error(`Veuillez corriger les quantités (${invalidItems.length} élément(s) avec quantité ≤ 0)`)
      return
    }
  
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error("Erreur d'authentification")
        return
      }
  
      const nomAffichage = user.user_metadata?.full_name || 
                          user.user_metadata?.name ||
                          (user.email ? user.email.split('@')[0] : null) || 
                          'Utilisateur'
  
      // Vérification des outils critiques
      const referencesOutilsCritiques = new Set<string>()
      for (const item of selectedItems) {
        if (item.type === 'patte') {
          const patte = patteItems.find(p => p.id === item.id)
          if (!patte) continue
  
          if (item.outilIndex) {
            const refOutil = patte[`reference_outil_${item.outilIndex}` as keyof PatteItem] as string
            if (refOutil) referencesOutilsCritiques.add(refOutil)
          } else {
            [1, 2, 3].forEach(num => {
              const ref = patte[`reference_outil_${num}` as keyof PatteItem] as string
              if (ref) referencesOutilsCritiques.add(ref)
            })
          }
        } else if (item.type === 'coupelle') {
          const coupelle = coupelleItems.find(c => c.id === item.id)
          if (!coupelle) continue
  
          if (!item.outilIndex) {
            [1, 2, 3].forEach(num => {
              const assise = coupelle[`assise_coupelle_${num}` as keyof CoupelleItem] as string
              const axe = coupelle[`axe_coupelle_${num}` as keyof CoupelleItem] as string
              if (assise) referencesOutilsCritiques.add(assise)
              if (axe) referencesOutilsCritiques.add(axe)
            })
          } else {
            if (item.assise) {
              const ref = coupelle[`assise_coupelle_${item.outilIndex}` as keyof CoupelleItem] as string
              if (ref) referencesOutilsCritiques.add(ref)
            }
            if (item.axe) {
              const ref = coupelle[`axe_coupelle_${item.outilIndex}` as keyof CoupelleItem] as string
              if (ref) referencesOutilsCritiques.add(ref)
            }
          }
        }
      }
  
      if (referencesOutilsCritiques.size > 0) {
        const { data: outilsCritiques, error: critiqueError } = await supabase
          .from('outil_critique') 
          .select('reference_outil')
          .in('reference_outil', Array.from(referencesOutilsCritiques))
  
        if (critiqueError) throw critiqueError
  
        // 🆕 SI OUTILS CRITIQUES : OUVRIR LA MODALE AU LIEU DU WINDOW.CONFIRM
        if (outilsCritiques?.length > 0) {
          setOutilsCritiquesData(outilsCritiques)
          setPendingValidationItems([...selectedItems])
          setShowOutilCritiqueModal(true)
          return // Arrêter ici, la validation continuera après confirmation
        }
      }
  
      // 🔄 TRAITEMENT NORMAL SI PAS D'OUTILS CRITIQUES
      const now = new Date().toISOString()
      let successCount = 0
      let errorCount = 0
      let pendingSeuilItems = [] // Pour stocker les items en attente de confirmation de seuil
  
      // SORTIE : Traitement des items sélectionnés
      for (const item of selectedItems) {
        if (item.type === 'patte') {
          const patte = patteItems.find(p => p.id === item.id)
          if (!patte) continue
  
          if (item.outilIndex) {
            // Outil spécifique sélectionné
            const reference = patte.reference
            const reference_outil = patte[`reference_outil_${item.outilIndex}` as keyof PatteItem] as string
            const emplacement = patte[`emplacement_outil_${item.outilIndex}` as keyof PatteItem] as string
  
            if (!reference || !reference_outil) continue
  
            const result = await insertSortieHistorique(
              reference,
              reference_outil,
              emplacement,
              item.quantite,
              user.id,
              nomAffichage,
              now
            )
  
            if (result.success) {
              successCount++
              if (result.depassement) toast.success(result.message, { icon: '⚠️' })
            } else if (result.requiresConfirmation) {
              pendingSeuilItems.push({ reference_outil, result })
            } else {
              errorCount++
              toast.error(result.message)
            }
          } else {
            // Tous les outils de la patte sélectionnés
            for (const num of [1, 2, 3]) {
              const reference_outil = patte[`reference_outil_${num}` as keyof PatteItem] as string
              const emplacement = patte[`emplacement_outil_${num}` as keyof PatteItem] as string
              
              if (!reference_outil) continue
  
              const result = await insertSortieHistorique(
                patte.reference,
                reference_outil,
                emplacement,
                item.quantite,
                user.id,
                nomAffichage,
                now
              )
  
              if (result.success) {
                successCount++
                if (result.depassement) toast.success(result.message, { icon: '⚠️' })
              } else if (result.requiresConfirmation) {
                pendingSeuilItems.push({ reference_outil, result })
              } else {
                errorCount++
                toast.error(result.message)
              }
            }
          }
        } else if (item.type === 'coupelle') {
          const coupelle = coupelleItems.find(c => c.id === item.id)
          if (!coupelle) continue
  
          const reference = coupelle.reference_amortisseur
          
          if (!item.outilIndex) {
            // Tous les outils de la coupelle sélectionnés
            for (const num of [1, 2, 3]) {
              const assise = coupelle[`assise_coupelle_${num}` as keyof CoupelleItem] as string
              const axe = coupelle[`axe_coupelle_${num}` as keyof CoupelleItem] as string
              
              if (assise) {
                const result = await insertSortieHistorique(
                  reference,
                  assise,
                  coupelle[`emp_ass_${num}` as keyof CoupelleItem] as string,
                  item.quantite,
                  user.id,
                  nomAffichage,
                  now
                )
                if (result.success) {
                  successCount++
                  if (result.depassement) toast.success(result.message, { icon: '⚠️' })
                } else if (result.requiresConfirmation) {
                  pendingSeuilItems.push({ reference_outil: assise, result })
                } else {
                  errorCount++
                  toast.error(result.message)
                }
              }
  
              if (axe) {
                const result = await insertSortieHistorique(
                  reference,
                  axe,
                  coupelle[`emp_axe_${num}` as keyof CoupelleItem] as string,
                  item.quantite,
                  user.id,
                  nomAffichage,
                  now
                )
                if (result.success) {
                  successCount++
                  if (result.depassement) toast.success(result.message, { icon: '⚠️' })
                } else if (result.requiresConfirmation) {
                  pendingSeuilItems.push({ reference_outil: axe, result })
                } else {
                  errorCount++
                  toast.error(result.message)
                }
              }
            }
            continue
          }
  
          // Outil spécifique sélectionné
          if (item.assise) {
            const reference_outil = coupelle[`assise_coupelle_${item.outilIndex}` as keyof CoupelleItem] as string
            if (reference_outil) {
              const result = await insertSortieHistorique(
                reference,
                reference_outil,
                coupelle[`emp_ass_${item.outilIndex}` as keyof CoupelleItem] as string,
                item.quantite,
                user.id,
                nomAffichage,
                now
              )
              if (result.success) {
                successCount++
                if (result.depassement) toast.success(result.message, { icon: '⚠️' })
              } else if (result.requiresConfirmation) {
                pendingSeuilItems.push({ reference_outil, result })
              } else {
                errorCount++
                toast.error(result.message)
              }
            }
          }
  
          if (item.axe) {
            const reference_outil = coupelle[`axe_coupelle_${item.outilIndex}` as keyof CoupelleItem] as string
            if (reference_outil) {
              const result = await insertSortieHistorique(
                reference,
                reference_outil,
                coupelle[`emp_axe_${item.outilIndex}` as keyof CoupelleItem] as string,
                item.quantite,
                user.id,
                nomAffichage,
                now
              )
              if (result.success) {
                successCount++
                if (result.depassement) toast.success(result.message, { icon: '⚠️' })
              } else if (result.requiresConfirmation) {
                pendingSeuilItems.push({ reference_outil, result })
              } else {
                errorCount++
                toast.error(result.message)
              }
            }
          }
        }
      }
  
      // Si des items sont en attente de confirmation de seuil, ne pas nettoyer encore
      if (pendingSeuilItems.length > 0) {
        if (successCount > 0) toast.success(`${successCount} sortie(s) validée(s)`)
        if (errorCount > 0) toast.error(`${errorCount} erreur(s)`)
        toast(`${pendingSeuilItems.length} outil(s) en attente de confirmation de seuil`, { 
          icon: 'ℹ️',
          duration: 4000 
        })
        return
      }
  
      // Nettoyage et rechargement seulement si tout est terminé
      setSelectedItems([])
      setCoupelleItems([])
      setPatteItems([])
      setExistingCalais([])
      setSearchTerm('')
      await loadTodayHistory()
      await loadOutilsEnCours()
  
      if (successCount > 0) toast.success(`${successCount} sortie(s) validée(s)`)
      if (errorCount > 0) toast.error(`${errorCount} erreur(s)`)
  
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  } 
   

  useEffect(() => {
    loadTodayHistory()
    loadTodayEntryHistory()
    loadOutilsEnCours()
  }, [])

  return {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    quantite,
    setQuantite,
    caleEpaisseur,
    setCaleEpaisseur,
    coupelleItems,
    patteItems,
    selectedItems,
    isLoading,
    showCaleModal,
    showEntreeModal,
    todayHistory,
    todayEntryHistory,
    currentCaleItem,
    currentEntreeItem,
    outilsEnCours,
    showOutilWarning,
    warningMessage,
    mouvementType,
    setMouvementType,
    setSelectedItems,
    setShowCaleModal,
    setCurrentCaleItem,
    setShowEntreeModal,
    setCurrentEntreeItem,
    setShowOutilWarning,
    handleSearch,
    handleSearchWrapper,
    toggleItemSelection,
    isItemSelected,
    getItemQuantite,
    updateQuantite,
    handleCaleConfirmation,
    handleEntreeConfirmation,
    handleValidation,
    handleSelectOutilEnCours,
    loadTodayHistory, // ✅ AJOUTER CETTE VIRGULE
    
    // Nouveaux états pour les modales
    showSeuilModal,
    setShowSeuilModal,
    seuilModalData,
    showOutilCritiqueModal,
    setShowOutilCritiqueModal,
    outilsCritiquesData,
    isNettoyageConfirmed,
    setIsNettoyageConfirmed,
    
    // Nouvelles fonctions
    handleSeuilConfirmation,
    handleOutilCritiqueConfirmation , 

    showCaleExistanteModal,
  caleExistanteData,
  handleCaleExistanteConfirmation,
  handleCaleExistanteCancel
  } 
}  