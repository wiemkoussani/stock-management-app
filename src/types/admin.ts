// Add these to your existing types in admin.ts
export type CaleSortBy = 'date' | 'assise' | 'axe'
export type CaleDateFilter = 'custom' | 'day' | 'month' | 'year' | 'all'
export type HistorySortBy = 'date' | 'reference' | 'reference_outil'
export type HistoryDateFilter = 'custom' | 'day' | 'month' | 'year' | 'all'
export type SearchType = 'reference_amortisseur' | 'reference_composant' | 'reference_outils'
export interface PatteTool {
    id: string
    reference_patte_anneau: string
    reference: string
    reference_outil_1: string | null
    emplacement_outil_1: string | null
    reference_outil_2: string | null
    emplacement_outil_2: string | null
    reference_outil_3: string | null
    emplacement_outil_3: string | null
    commentaire: string | null
    observation: string | null
    created_at: string
  }
  export interface CriticalTool {
    id?: string 
    reference: string
    reference_composant: string | null
    reference_outil: string | null
    emplacement: string | null
    created_at?: string 
  }
  export interface SearchResults {
    patteItems: PatteTool[];
    coupelleItems: CoupelleTool[];
  }
  export interface CoupelleTool {
    id: string
    reference_amortisseur: string
    reference_coupelle: string
    assise_coupelle_1: string | null
    emp_ass_1: string | null
    axe_coupelle_1: string | null
    emp_axe_1: string | null
    remarque_outil_1: string | null
    assise_coupelle_2: string | null
    emp_ass_2: string | null
    axe_coupelle_2: string | null
    emp_axe_2: string | null
    remarque_outil_2: string | null
    assise_coupelle_3: string | null
    emp_ass_3: string | null
    axe_coupelle_3: string | null
    emp_axe_3: string | null
    remarque_outil_3: string | null
    created_at: string
  }
  
  export interface HistoryItem {
    id: string
    reference: string
    reference_outil: string | null
    emplacement: string | null
    nom_prenom_personne: string
    activite: string
    quantite: number
    date_operation: string
    created_by: string
  }
  
  
  export interface CaleHistoryItem {
    id: string
    assise_coupelle: string
    axe_coupelle: string
    nom_prenom: string
    epaisseur_cale: number
    temps_activite: string
    user_id: string
  }
  export interface User {
    id: string
    username: string
    password?: string
    created_at: string
  }
  
  export interface UserFormData {
    username: string
    password: string
    confirmPassword: string
  }