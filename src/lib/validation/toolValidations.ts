// src/lib/validation/toolValidations.ts
import { supabase } from '@/lib/supabase'
import { PatteTool, CoupelleTool } from '@/types/admin'

function toStringSafe(value: string | number | null): string | undefined {
  return value !== null ? String(value) : undefined
}

async function checkEmplacementInPatte(emplacement: string) {
  const { data, error } = await supabase
    .from('outils_soudage_patte')
    .select('id, reference, emplacement_outil_1, emplacement_outil_2, emplacement_outil_3, reference_outil_1, reference_outil_2, reference_outil_3')
    .or(
      `emplacement_outil_1.eq.${emplacement},emplacement_outil_2.eq.${emplacement},emplacement_outil_3.eq.${emplacement}`
    )

  if (error) throw error

  return data?.map(tool => {
    let refOutil = ''
    if (tool.emplacement_outil_1 === emplacement) refOutil = tool.reference_outil_1 || ''
    else if (tool.emplacement_outil_2 === emplacement) refOutil = tool.reference_outil_2 || ''
    else if (tool.emplacement_outil_3 === emplacement) refOutil = tool.reference_outil_3 || ''

    return `${tool.reference} (${refOutil})`
  }) || []
}

async function checkEmplacementInCoupelle(emplacement: string) {
  const { data, error } = await supabase
    .from('outils_soudage_coupelle')
    .select(`
      id,
      reference_amortisseur,
      emp_ass_1, emp_ass_2, emp_ass_3,
      emp_axe_1, emp_axe_2, emp_axe_3,
      assise_coupelle_1, assise_coupelle_2, assise_coupelle_3,
      axe_coupelle_1, axe_coupelle_2, axe_coupelle_3
    `)
    .or(
      `emp_ass_1.eq.${emplacement},emp_ass_2.eq.${emplacement},emp_ass_3.eq.${emplacement},emp_axe_1.eq.${emplacement},emp_axe_2.eq.${emplacement},emp_axe_3.eq.${emplacement}`
    )

  if (error) throw error

  return data?.map(tool => {
    let refOutil = ''

    // Check assise positions
    if (tool.emp_ass_1 === emplacement) refOutil = tool.assise_coupelle_1 || ''
    else if (tool.emp_ass_2 === emplacement) refOutil = tool.assise_coupelle_2 || ''
    else if (tool.emp_ass_3 === emplacement) refOutil = tool.assise_coupelle_3 || ''
    // Check axe positions
    else if (tool.emp_axe_1 === emplacement) refOutil = tool.axe_coupelle_1 || ''
    else if (tool.emp_axe_2 === emplacement) refOutil = tool.axe_coupelle_2 || ''
    else if (tool.emp_axe_3 === emplacement) refOutil = tool.axe_coupelle_3 || ''

    return `${tool.reference_amortisseur} (${refOutil})`
  }) || []
}

export const validatePatteEmplacements = async (item: PatteTool & { type: 'patte' }) => {
  const emplacements = [
    toStringSafe(item.emplacement_outil_1),
    toStringSafe(item.emplacement_outil_2),
    toStringSafe(item.emplacement_outil_3)
  ].filter((e): e is string => e !== undefined)

  // Check internal duplicates
  if (new Set(emplacements).size !== emplacements.length) {
    throw new Error('Les emplacements doivent être uniques pour cet outil')
  }

  // Get original emplacements
  const { data: originalItem, error: originalError } = await supabase
    .from('outils_soudage_patte')
    .select('emplacement_outil_1, emplacement_outil_2, emplacement_outil_3')
    .eq('id', item.id)
    .single()

  if (originalError) {
    throw new Error(`Erreur lors de la récupération de l'outil original: ${originalError.message}`)
  }

  const originalEmplacements = [
    toStringSafe(originalItem?.emplacement_outil_1),
    toStringSafe(originalItem?.emplacement_outil_2),
    toStringSafe(originalItem?.emplacement_outil_3)
  ].filter((e): e is string => e !== undefined)

  // Check new emplacements
  const nouveauxEmplacements = emplacements.filter(e => !originalEmplacements.includes(e))
  const conflits: string[] = []

  for (const emp of nouveauxEmplacements) {
    const patteRefs = await checkEmplacementInPatte(emp)
    const coupelleRefs = await checkEmplacementInCoupelle(emp)

    if (patteRefs.length > 0) {
      conflits.push(`Emplacement ${emp} déjà utilisé par patte(s): ${patteRefs.join(', ')}`)
    }

    if (coupelleRefs.length > 0) {
      conflits.push(`Emplacement ${emp} déjà utilisé par coupelle(s): ${coupelleRefs.join(', ')}`)
    }
  }

  if (conflits.length > 0) {
    throw new Error(conflits.join('\n'))
  }
}

export const validateCoupelleEmplacements = async (item: CoupelleTool & { type: 'coupelle' }) => {
  // Check internal duplicates
  const pairesEmplacements = [
    { assise: toStringSafe(item.emp_ass_1), axe: toStringSafe(item.emp_axe_1), numero: 1 },
    { assise: toStringSafe(item.emp_ass_2), axe: toStringSafe(item.emp_axe_2), numero: 2 },
    { assise: toStringSafe(item.emp_ass_3), axe: toStringSafe(item.emp_axe_3), numero: 3 }
  ].filter(p => p.assise !== undefined || p.axe !== undefined)

  const doublons: string[] = []
  for (let i = 0; i < pairesEmplacements.length; i++) {
    for (let j = i + 1; j < pairesEmplacements.length; j++) {
      const paireA = pairesEmplacements[i]
      const paireB = pairesEmplacements[j]
      
      if (paireA.assise && paireA.assise === paireB.assise) {
        doublons.push(`Assise ${paireA.assise} dupliquée entre paire ${paireA.numero} et paire ${paireB.numero}`)
      }
      if (paireA.axe && paireA.axe === paireB.axe) {
        doublons.push(`Axe ${paireA.axe} dupliqué entre paire ${paireA.numero} et paire ${paireB.numero}`)
      }
    }
  }

  if (doublons.length > 0) {
    throw new Error(`Conflits dans le même outil:\n${doublons.join('\n')}`)
  }

  // Check external conflicts
  const emplacements = pairesEmplacements.flatMap(p => [p.assise, p.axe]).filter((e): e is string => e !== undefined)
  const { data: originalItem, error: originalError } = await supabase
    .from('outils_soudage_coupelle')
    .select('emp_ass_1, emp_axe_1, emp_ass_2, emp_axe_2, emp_ass_3, emp_axe_3')
    .eq('id', item.id)
    .single()

  if (originalError) {
    throw new Error(`Erreur lors de la récupération de l'outil original: ${originalError.message}`)
  }

  const originalEmplacements = [
    toStringSafe(originalItem?.emp_ass_1),
    toStringSafe(originalItem?.emp_axe_1),
    toStringSafe(originalItem?.emp_ass_2),
    toStringSafe(originalItem?.emp_axe_2),
    toStringSafe(originalItem?.emp_ass_3),
    toStringSafe(originalItem?.emp_axe_3)
  ].filter((e): e is string => e !== undefined)

  const nouveauxEmplacements = emplacements.filter(e => !originalEmplacements.includes(e))
  const conflits: string[] = []

  for (const emp of nouveauxEmplacements) {
    const patteRefs = await checkEmplacementInPatte(emp)
    const coupelleRefs = await checkEmplacementInCoupelle(emp)

    if (patteRefs.length > 0) {
      conflits.push(`Emplacement ${emp} déjà utilisé par patte(s): ${patteRefs.join(', ')}`)
    }

    if (coupelleRefs.length > 0) {
      conflits.push(`Emplacement ${emp} déjà utilisé par coupelle(s): ${coupelleRefs.join(', ')}`)
    }
  }

  if (conflits.length > 0) {
    throw new Error(conflits.join('\n'))
  }
} 