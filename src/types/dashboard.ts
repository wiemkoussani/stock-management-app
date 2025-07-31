export type SearchType = 'reference_amortisseur' | 'reference_composant' | 'reference_outils'
export type MouvementType = 'entree' | 'sortie'



export interface OutilEnCours {
  id: string
  reference: string
  reference_outil: string
  emplacement: string
  nom_prenom_personne: string
  activite: string
  quantite: number
  date_operation: string
}


export interface CoupelleItem {
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
}

export interface PatteItem {
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
}

export interface CaleItem {
  assise_coupelle: string
  axe_coupelle: string | null
  epaisseur_cale: number
}

export type SelectedItem = {
  id: string
  type: 'coupelle' | 'patte' | 'cale'
  outilIndex?: number
  quantite: number
  caleEpaisseur?: number
  assise?: string | null
  axe?: string | null
}

export interface HistoryItem {
  id: string
  reference: string
  reference_outil: string
  emplacement: string | null
  nom_prenom_personne: string
  activite: 'corrective' | 'preventive'
  quantite: number
  created_by: string
  date_operation: string
  depassement?: boolean
}

// New types for entry functionality
export interface EntryHistoryItem {
  id: string
  reference: string
  reference_outil?: string
  emplacement: string
  nom_prenom_personne: string
  quantite: number
  date_operation: string
}

export interface EntryItem {
  id: string
  reference: string
  reference_outil?: string
  emplacement: string
} 