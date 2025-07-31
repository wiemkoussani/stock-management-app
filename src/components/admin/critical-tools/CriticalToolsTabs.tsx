'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { CriticalTool, PatteTool, CoupelleTool, SearchType } from '@/types/admin'
import CriticalToolsFilters from './CriticalToolsFilters'
interface CriticalToolGroup {
  tools: CriticalTool[]
  reference: string
  reference_composant: string | null
  type: 'coupelle' | 'patte'
} 
interface SupabaseError {
  message?: string
  details?: string
  hint?: string
  code?: string
}

interface CoupelleToolGroup {
  assise?: CriticalTool
  axe?: CriticalTool
  groupIndex: number
}

const getErrorInfo = (error: unknown): SupabaseError => {
  if (error && typeof error === 'object') {
    return error as SupabaseError
  }
  return { message: 'Unknown error occurred' }
}

export default function CriticalToolsTabs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('reference_amortisseur')
  const [patteItems, setPatteItems] = useState<PatteTool[]>([])
  const [coupelleItems, setCoupelleItems] = useState<CoupelleTool[]>([])
  const [criticalTools, setCriticalTools] = useState<CriticalTool[]>([])
  const [loading, setLoading] = useState({
    search: false,
    critical: true,
    adding: false
  })
  const [selectedItems, setSelectedItems] = useState<CriticalTool[]>([])
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())

  const fetchCriticalTools = async () => {
    try {
      setLoading(prev => ({ ...prev, critical: true }))
      
      const { data, error } = await supabase
        .from('outil_critique')
        .select('id, reference, reference_composant, reference_outil, emplacement')
      
      if (error) throw error

      setCriticalTools(data || [])
      
    } catch (error) {
      const errorInfo = getErrorInfo(error)
      toast.error(`Erreur: ${errorInfo.message || 'Failed to load critical tools'}`)
    } finally {
      setLoading(prev => ({ ...prev, critical: false }))
    }
  }

  useEffect(() => {
    fetchCriticalTools()
  }, [])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setLoading(prev => ({...prev, search: true}))
    setPatteItems([])
    setCoupelleItems([])
    setSelectedItems([])
    setSelectedGroups(new Set())
    
    try {
      let queryPatte = supabase.from('outils_soudage_patte').select('*')
      let queryCoupelle = supabase.from('outils_soudage_coupelle').select('*')

      switch(searchType) {
        case 'reference_amortisseur':
          queryPatte = queryPatte.ilike('reference', `%${searchTerm}%`)
          queryCoupelle = queryCoupelle.ilike('reference_amortisseur', `%${searchTerm}%`)
          break
        case 'reference_composant':
          queryPatte = queryPatte.ilike('reference_patte_anneau', `%${searchTerm}%`)
          queryCoupelle = queryCoupelle.ilike('reference_coupelle', `%${searchTerm}%`)
          break
        case 'reference_outils':
          queryPatte = queryPatte.or(
            `reference_outil_1.ilike.%${searchTerm}%,` +
            `reference_outil_2.ilike.%${searchTerm}%,` +
            `reference_outil_3.ilike.%${searchTerm}%`
          )
          queryCoupelle = queryCoupelle.or(
            `assise_coupelle_1.ilike.%${searchTerm}%,` +
            `axe_coupelle_1.ilike.%${searchTerm}%,` +
            `assise_coupelle_2.ilike.%${searchTerm}%,` +
            `axe_coupelle_2.ilike.%${searchTerm}%,` +
            `assise_coupelle_3.ilike.%${searchTerm}%,` +
            `axe_coupelle_3.ilike.%${searchTerm}%`
          )
          break
      }

      const [
        { data: patteData, error: patteError }, 
        { data: coupelleData, error: coupelleError }
      ] = await Promise.all([queryPatte, queryCoupelle])

      if (patteError) throw patteError
      if (coupelleError) throw coupelleError

      setPatteItems(patteData || [])
      setCoupelleItems(coupelleData || [])

      if ((patteData?.length || 0) + (coupelleData?.length || 0) === 0) {
        toast('No results found', { icon: 'ℹ️' })
      } else {
        toast.success(`${(patteData?.length || 0) + (coupelleData?.length || 0)} results found`)
      }

    } catch (error) {
      toast.error('Search error')
    } finally {
      setLoading(prev => ({...prev, search: false}))
    }
  }

  const getPatteTools = (item: PatteTool): CriticalTool[] => {
    const tools: CriticalTool[] = []
    
    if (item.reference_outil_1) tools.push({
      reference: item.reference,
      reference_composant: item.reference_patte_anneau,
      reference_outil: item.reference_outil_1,
      emplacement: item.emplacement_outil_1,
    })
    if (item.reference_outil_2) tools.push({
      reference: item.reference,
      reference_composant: item.reference_patte_anneau,
      reference_outil: item.reference_outil_2,
      emplacement: item.emplacement_outil_2,
    })
    if (item.reference_outil_3) tools.push({
      reference: item.reference,
      reference_composant: item.reference_patte_anneau,
      reference_outil: item.reference_outil_3,
      emplacement: item.emplacement_outil_3,
    })

    return tools
  }

  const getCoupelleToolGroups = (item: CoupelleTool): CoupelleToolGroup[] => {
    const groups: CoupelleToolGroup[] = []
    
    // Groupe 1
    if (item.assise_coupelle_1 || item.axe_coupelle_1) {
      const group: CoupelleToolGroup = { groupIndex: 1 }
      if (item.assise_coupelle_1) {
        group.assise = {
          reference: item.reference_amortisseur,
          reference_composant: item.reference_coupelle,
          reference_outil: item.assise_coupelle_1,
          emplacement: item.emp_ass_1
        }
      }
      if (item.axe_coupelle_1) {
        group.axe = {
          reference: item.reference_amortisseur,
          reference_composant: item.reference_coupelle,
          reference_outil: item.axe_coupelle_1,
          emplacement: item.emp_axe_1
        }
      }
      groups.push(group)
    }

    // Groupe 2
    if (item.assise_coupelle_2 || item.axe_coupelle_2) {
      const group: CoupelleToolGroup = { groupIndex: 2 }
      if (item.assise_coupelle_2) {
        group.assise = {
          reference: item.reference_amortisseur,
          reference_composant: item.reference_coupelle,
          reference_outil: item.assise_coupelle_2,
          emplacement: item.emp_ass_2
        }
      }
      if (item.axe_coupelle_2) {
        group.axe = {
          reference: item.reference_amortisseur,
          reference_composant: item.reference_coupelle,
          reference_outil: item.axe_coupelle_2,
          emplacement: item.emp_axe_2
        }
      }
      groups.push(group)
    }

    // Groupe 3
    if (item.assise_coupelle_3 || item.axe_coupelle_3) {
      const group: CoupelleToolGroup = { groupIndex: 3 }
      if (item.assise_coupelle_3) {
        group.assise = {
          reference: item.reference_amortisseur,
          reference_composant: item.reference_coupelle,
          reference_outil: item.assise_coupelle_3,
          emplacement: item.emp_ass_3
        }
      }
      if (item.axe_coupelle_3) {
        group.axe = {
          reference: item.reference_amortisseur,
          reference_composant: item.reference_coupelle,
          reference_outil: item.axe_coupelle_3,
          emplacement: item.emp_axe_3
        }
      }
      groups.push(group)
    }

    return groups
  }

  const getGroupKey = (item: CoupelleTool, groupIndex: number): string => {
    return `${item.reference_amortisseur}-${item.reference_coupelle}-${groupIndex}`
  }

  const handleItemSelection = (tool: CriticalTool, isSelected: boolean) => {
    setSelectedItems(prev => 
      isSelected 
        ? [...prev, tool] 
        : prev.filter(selected => 
            selected.reference !== tool.reference || 
            selected.reference_outil !== tool.reference_outil
          )
    )
  }

  const handleGroupSelection = (item: CoupelleTool, group: CoupelleToolGroup, isSelected: boolean) => {
    const groupKey = getGroupKey(item, group.groupIndex)
    
    setSelectedGroups(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(groupKey)
      } else {
        newSet.delete(groupKey)
      }
      return newSet
    })

    // Ajouter/retirer les outils du groupe
    setSelectedItems(prev => {
      let newItems = [...prev]
      
      if (isSelected) {
        // Ajouter les outils du groupe
        if (group.assise && !isToolAlreadySelected(group.assise, newItems)) {
          newItems.push(group.assise)
        }
        if (group.axe && !isToolAlreadySelected(group.axe, newItems)) {
          newItems.push(group.axe)
        }
      } else {
        // Retirer les outils du groupe
        if (group.assise) {
          newItems = newItems.filter(item => 
            !(item.reference === group.assise!.reference && 
              item.reference_outil === group.assise!.reference_outil)
          )
        }
        if (group.axe) {
          newItems = newItems.filter(item => 
            !(item.reference === group.axe!.reference && 
              item.reference_outil === group.axe!.reference_outil)
          )
        }
      }
      
      return newItems
    })
  }

  const isToolAlreadySelected = (tool: CriticalTool, selectedList: CriticalTool[]): boolean => {
    return selectedList.some(
      selected => 
        selected.reference === tool.reference && 
        selected.reference_outil === tool.reference_outil
    )
  }

  const isItemSelected = (tool: CriticalTool): boolean => {
    return selectedItems.some(
      selected => 
        selected.reference === tool.reference && 
        selected.reference_outil === tool.reference_outil
    )
  }

  const isGroupSelected = (item: CoupelleTool, group: CoupelleToolGroup): boolean => {
    const groupKey = getGroupKey(item, group.groupIndex)
    return selectedGroups.has(groupKey)
  }

  const isToolAlreadyInCritical = (tool: CriticalTool): boolean => {
    return criticalTools.some(
      existing => 
        existing.reference === tool.reference && 
        existing.reference_outil === tool.reference_outil
    )
  }

  const isGroupAlreadyInCritical = (group: CoupelleToolGroup): boolean => {
    const assiseInCritical = group.assise ? isToolAlreadyInCritical(group.assise) : false
    const axeInCritical = group.axe ? isToolAlreadyInCritical(group.axe) : false
    
    // Si les deux existent, les deux doivent être dans critical
    if (group.assise && group.axe) {
      return assiseInCritical && axeInCritical
    }
    // Si un seul existe, il doit être dans critical
    return assiseInCritical || axeInCritical
  }

  const resetSearch = () => {
    setSearchTerm('')
    setPatteItems([])
    setCoupelleItems([])
    setSelectedItems([])
    setSelectedGroups(new Set())
  }

  const addSelectedToCritical = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected')
      return
    }
  
    // Check for duplicates
    const duplicates = selectedItems.filter(item => isToolAlreadyInCritical(item))
    if (duplicates.length > 0) {
      toast.error(`${duplicates.length} tool(s) already exist in critical tools: ${duplicates.map(d => d.reference_outil).join(', ')}`)
      return
    }
  
    try {
      setLoading(prev => ({ ...prev, adding: true }))
      
      const itemsToInsert = selectedItems.map(item => {
        // Détecter le type basé sur l'origine de l'item
        let typeIndicator = ''
        
        // Cherchez dans les groupes coupelle pour voir si cet outil vient d'assise ou axe
        for (const coupelleItem of coupelleItems) {
          const groups = getCoupelleToolGroups(coupelleItem)
          for (const group of groups) {
            if (group.assise && group.assise.reference_outil === item.reference_outil) {
              typeIndicator = '_assise'
              break
            }
            if (group.axe && group.axe.reference_outil === item.reference_outil) {
              typeIndicator = '_axe'  
              break
            }
          }
          if (typeIndicator) break
        }
        
        return {
          reference: item.reference,
          reference_composant: item.reference_composant,
          reference_outil: item.reference_outil,
          emplacement: item.emplacement ? `${item.emplacement}${typeIndicator}` : typeIndicator || null
        }
      })
      
      const { error } = await supabase
        .from('outil_critique')
        .insert(itemsToInsert)
  
      if (error) throw error
  
      await fetchCriticalTools()
      resetSearch()
      toast.success(`${selectedItems.length} tools added`)
    } catch (error) {
      toast.error('Failed to add tools')
    } finally {
      setLoading(prev => ({ ...prev, adding: false }))
    }
  } 

  const deleteCriticalTool = async (toolId: string) => {
    try {
      const { error } = await supabase
        .from('outil_critique')
        .delete()
        .eq('id', toolId)

      if (error) throw error

      setCriticalTools(prev => prev.filter(tool => tool.id !== toolId))
      toast.success('Tool deleted')
    } catch (error) {
      toast.error('Failed to delete tool')
    }
  }

  const allPatteTools = patteItems.flatMap(item => getPatteTools(item))
  const allCoupelleGroups = coupelleItems.flatMap(item => 
    getCoupelleToolGroups(item).map(group => ({ item, group }))
  )
  const allCoupelleToolsCount = allCoupelleGroups.reduce((count, { group }) => {
    return count + (group.assise ? 1 : 0) + (group.axe ? 1 : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-800">🔧 Critical Tools Management</h1>
              <p className="text-blue-600 mt-2">Manage your critical welding tools</p>
            </div>
            <div className="bg-blue-100 px-6 py-3 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{criticalTools.length}</div>
              <div className="text-sm text-blue-600">Registered Tools</div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
          <CriticalToolsFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchType={searchType}
            setSearchType={setSearchType}
            onSearch={handleSearch}
            onReset={resetSearch}
          />
        </div>

        {/* Search Results */}
        {(loading.search || patteItems.length > 0 || coupelleItems.length > 0) && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            {loading.search ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-800">📊 Search Results</h2>
                    <p className="text-blue-600">
                      {allPatteTools.length + allCoupelleToolsCount} tools found
                    </p>
                  </div>
                  <button
                    onClick={addSelectedToCritical}
                    disabled={selectedItems.length === 0 || loading.adding}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedItems.length === 0 || loading.adding
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {loading.adding ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      `Add Selected (${selectedItems.length})`
                    )}
                  </button>
                </div>

                {/* Patte Tools */}
                {patteItems.length > 0 && (
                  <div className="mb-8">
                    <div className="bg-blue-100 p-4 rounded-lg mb-4 border border-blue-200">
                      <h3 className="text-xl font-semibold text-blue-800">
                        🔩 Patte Tools
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {patteItems.length} references • {allPatteTools.length} tools
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {patteItems.map((item, index) => (
                        <div key={`patte-${index}`} className="border border-blue-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="mb-3">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <div className="font-medium text-blue-800">
                                {item.reference_patte_anneau}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              Ref: {item.reference}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {getPatteTools(item).map((tool, toolIndex) => {
                              const isAlreadyInCritical = isToolAlreadyInCritical(tool)
                              return (
                                <div 
                                  key={`patte-tool-${toolIndex}`}
                                  className={`flex items-center justify-between p-3 rounded border transition-all ${
                                    isAlreadyInCritical
                                      ? 'bg-red-50 border-red-200 opacity-60'
                                      : isItemSelected(tool) 
                                        ? 'bg-blue-50 border-blue-300' 
                                        : 'bg-white border-gray-200 hover:border-blue-200'
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium">{tool.reference_outil}</div>
                                    {tool.emplacement && (
                                      <div className="text-xs text-gray-500">
                                        📍 {tool.emplacement}
                                      </div>
                                    )}
                                    {isAlreadyInCritical && (
                                      <div className="text-xs text-red-500 font-medium">
                                        ⚠️ Already in critical tools
                                      </div>
                                    )}
                                  </div>
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isItemSelected(tool)}
                                      onChange={(e) => handleItemSelection(tool, e.target.checked)}
                                      disabled={isAlreadyInCritical}
                                      className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                      isAlreadyInCritical
                                        ? 'bg-red-200 border-red-300 cursor-not-allowed'
                                        : isItemSelected(tool) 
                                          ? 'bg-blue-500 border-blue-500 text-white' 
                                          : 'border-gray-300 hover:border-blue-400'
                                    }`}>
                                      {isItemSelected(tool) && '✓'}
                                      {isAlreadyInCritical && '✗'}
                                    </div>
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coupelle Tools */}
                {coupelleItems.length > 0 && (
                  <div className="mb-4">
                    <div className="bg-blue-100 p-4 rounded-lg mb-4 border border-blue-200">
                      <h3 className="text-xl font-semibold text-blue-800">
                        ⚡ Coupelle Tools
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {coupelleItems.length} references • {allCoupelleGroups.length} groups • {allCoupelleToolsCount} tools
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {coupelleItems.map((item, index) => (
                        <div key={`coupelle-${index}`} className="border border-blue-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="mb-3">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <div className="font-medium text-blue-800">
                                {item.reference_coupelle}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              Ref: {item.reference_amortisseur}
                            </div>
                          </div>
                          <div className="space-y-3">
                            {getCoupelleToolGroups(item).map((group, groupIndex) => {
                              const isAlreadyInCritical = isGroupAlreadyInCritical(group)
                              const isSelected = isGroupSelected(item, group)
                              
                              return (
                                <div 
                                  key={`coupelle-group-${groupIndex}`}
                                  className={`p-3 rounded border transition-all ${
                                    isAlreadyInCritical
                                      ? 'bg-red-50 border-red-200 opacity-60'
                                      : isSelected
                                        ? 'bg-blue-50 border-blue-300' 
                                        : 'bg-white border-gray-200 hover:border-blue-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-700 mb-2">
                                        Groupe {group.groupIndex}
                                      </div>
                                      
                                      {group.assise && (
                                        <div className="mb-2">
                                          <div className="text-sm font-medium text-green-600">
                                            🟢 Assise: {group.assise.reference_outil}
                                          </div>
                                          {group.assise.emplacement && (
                                            <div className="text-xs text-gray-500 ml-4">
                                              📍 {group.assise.emplacement}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {group.axe && (
                                        <div className="mb-2">
                                          <div className="text-sm font-medium text-purple-600">
                                            🔵 Axe: {group.axe.reference_outil}
                                          </div>
                                          {group.axe.emplacement && (
                                            <div className="text-xs text-gray-500 ml-4">
                                              📍 {group.axe.emplacement}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {isAlreadyInCritical && (
                                        <div className="text-xs text-red-500 font-medium">
                                          ⚠️ Already in critical tools
                                        </div>
                                      )}
                                    </div>
                                    
                                    <label className="flex items-center cursor-pointer ml-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => handleGroupSelection(item, group, e.target.checked)}
                                        disabled={isAlreadyInCritical}
                                        className="sr-only"
                                      />
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                        isAlreadyInCritical
                                          ? 'bg-red-200 border-red-300 cursor-not-allowed'
                                          : isSelected
                                            ? 'bg-blue-500 border-blue-500 text-white' 
                                            : 'border-gray-300 hover:border-blue-400'
                                      }`}>
                                        {isSelected && '✓'}
                                        {isAlreadyInCritical && '✗'}
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Critical Tools List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-blue-800">🎯 Registered Critical Tools</h2>
              <p className="text-blue-600">{criticalTools.length} tools in database</p>
            </div>
            <button
              onClick={fetchCriticalTools}
              disabled={loading.critical}
              className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <svg className={`w-4 h-4 mr-2 ${loading.critical ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loading.critical ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {criticalTools.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔧</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Critical Tools</h3>
                  <p className="text-gray-500">Start by searching and adding tools above</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Coupelle Tools Groups */}
                  {getCriticalCoupelleGroups().length > 0 && (
                    <div>
                      <div className="bg-blue-100 p-4 rounded-lg mb-4 border border-blue-200">
                        <h3 className="text-xl font-semibold text-blue-800">
                          ⚡ Coupelle Tools Groups
                        </h3>
                        <p className="text-blue-600 text-sm">
                          {getCriticalCoupelleGroups().length} groups registered
                        </p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {getCriticalCoupelleGroups().map((group: CriticalToolGroup, index: number) => (
                          <div key={`critical-coupelle-${index}`} className="border border-blue-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                            <div className="mb-3">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <div className="font-medium text-blue-800">
                                  {group.reference_composant || 'N/A'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                Ref: {group.reference}
                              </div>
                            </div>
                            <div className="space-y-2">
                              {group.tools.map((tool: CriticalTool, toolIndex: number) => {
                                const emp = tool.emplacement?.toLowerCase() || ''
                                const isAssise = emp.includes('ass')
                                const isAxe = emp.includes('axe') 
                                
                                return (
                                  <div 
                                    key={`critical-tool-${toolIndex}`}
                                    className="flex items-center justify-between p-3 rounded border bg-white border-gray-200"
                                  >
                                    <div className="flex-1">
                                      <div className={`font-medium ${isAssise ? 'text-green-600' : isAxe ? 'text-purple-600' : 'text-gray-800'}`}>
                                        {isAssise && '🟢 Assise: '}
                                        {isAxe && '🔵 Axe: '}
                                        {!isAssise && !isAxe && '⚪ '}
                                        {tool.reference_outil}
                                      </div>
                                      {tool.emplacement && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          📍 {tool.emplacement}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => tool.id && deleteCriticalTool(tool.id)}
                                      className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete tool"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patte Tools */}
                  {getCriticalPatteTools().length > 0 && (
                    <div>
                      <div className="bg-blue-100 p-4 rounded-lg mb-4 border border-blue-200">
                        <h3 className="text-xl font-semibold text-blue-800">
                          🔩 Patte Tools
                        </h3>
                        <p className="text-blue-600 text-sm">
                          {getCriticalPatteTools().length} tools registered
                        </p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {getCriticalPatteTools().map((tool: CriticalTool, index: number) => (
                          <div key={`critical-patte-${index}`} className="border border-blue-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                            <div className="mb-3">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <div className="font-medium text-blue-800">
                                  {tool.reference_composant || 'N/A'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                Ref: {tool.reference}
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded border bg-white border-gray-200">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                  🔩 Patte: {tool.reference_outil}
                                </div>
                                {tool.emplacement && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    📍 {tool.emplacement}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => tool.id && deleteCriticalTool(tool.id)}
                                className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete tool"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  function getCriticalCoupelleGroups(): CriticalToolGroup[] {
    const groups = new Map<string, CriticalTool[]>()
    
    criticalTools.forEach((tool: CriticalTool) => {
      const emp = tool.emplacement?.toLowerCase() || ''
      const isAssiseAxe = emp.includes('_assise') || emp.includes('_axe')
      
      if (isAssiseAxe) {
        const groupKey = `${tool.reference}-${tool.reference_composant}`
        if (!groups.has(groupKey)) {
          groups.set(groupKey, [])
        }
        groups.get(groupKey)!.push(tool)
      }
    })
    
    return Array.from(groups.entries()).map(([key, tools]) => ({
      tools,
      reference: tools[0].reference,
      reference_composant: tools[0].reference_composant,
      type: 'coupelle' as const
    }))
  }
  
  function getCriticalPatteTools(): CriticalTool[] {
    return criticalTools.filter((tool: CriticalTool) => {
      const emp = tool.emplacement?.toLowerCase() || ''
      return !emp.includes('_assise') && !emp.includes('_axe')
    }) 
  }
  
} 