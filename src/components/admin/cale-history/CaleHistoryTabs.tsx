'use client'
import { useState } from 'react'
import CaleHistoryFilters from './CaleHistoryFilters'
import CaleHistoryList from './CaleHistoryList'
import CaleHistoryForm from './CaleHistoryForm'
import useAdminCaleHistory from '@/lib/hooks/useAdminCaleHistory'
import { CaleHistoryItem } from '@/types/admin'

const CaleHistoryTabs = () => {
  const {
    caleHistoryItems,
    loading,
    caleSortBy,
    setCaleSortBy,
    caleDateFilter,
    setCaleDateFilter,
    caleCustomDate,
    setCaleCustomDate,
    caleAssiseFilter,
    setCaleAssiseFilter,
    caleAxeFilter,
    setCaleAxeFilter,
    deleteCaleHistoryItem,
    refetch
  } = useAdminCaleHistory()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<CaleHistoryItem | null>(null)

  return (
    <div className="space-y-6">
      <CaleHistoryFilters
        sortBy={caleSortBy}
        setSortBy={setCaleSortBy}
        dateFilter={caleDateFilter}
        setDateFilter={setCaleDateFilter}
        customDate={caleCustomDate}
        setCustomDate={setCaleCustomDate}
        assiseFilter={caleAssiseFilter}
        setAssiseFilter={setCaleAssiseFilter}
        axeFilter={caleAxeFilter}
        setAxeFilter={setCaleAxeFilter}
      />
      
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
        <div 
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <h2 className="text-xl font-semibold text-blue-800 group-hover:text-blue-900 transition-colors">
            Ajouter une nouvelle cale
          </h2>
          <svg
            className={`w-6 h-6 transform transition-all duration-200 text-blue-600 ${showAddForm ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {showAddForm && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <CaleHistoryForm 
              onCancel={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false)
                refetch()
              }}
            />
          </div>
        )}
      </div>

      {editingItem && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Modifier la cale</h2>
          <CaleHistoryForm 
            initialData={editingItem}
            onCancel={() => setEditingItem(null)}
            onSuccess={() => {
              setEditingItem(null)
              refetch()
            }}
          />
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
        <CaleHistoryList 
          caleHistoryItems={caleHistoryItems}
          loading={loading}
          onEdit={setEditingItem}
          onDelete={deleteCaleHistoryItem}
          sortBy={caleSortBy}
          dateFilter={caleDateFilter}
          customDate={caleCustomDate}
          assiseFilter={caleAssiseFilter}
          axeFilter={caleAxeFilter}
        />
      </div>
    </div>
  )
}

export default CaleHistoryTabs  