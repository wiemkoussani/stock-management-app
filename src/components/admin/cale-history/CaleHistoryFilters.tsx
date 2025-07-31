'use client'
import { useState, useEffect } from 'react'
import { CaleSortBy, CaleDateFilter } from '@/types/admin'

interface CaleHistoryFiltersProps {
  sortBy: CaleSortBy
  setSortBy: (sort: CaleSortBy) => void
  dateFilter: CaleDateFilter
  setDateFilter: (filter: CaleDateFilter) => void
  customDate: { start?: string; end?: string }
  setCustomDate: (dates: { start?: string; end?: string }) => void
  assiseFilter: string
  setAssiseFilter: (filter: string) => void
  axeFilter: string
  setAxeFilter: (filter: string) => void
}

const CaleHistoryFilters = ({
  sortBy,
  setSortBy,
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
  assiseFilter,
  setAssiseFilter,
  axeFilter,
  setAxeFilter
}: CaleHistoryFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CaleSortBy)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="date">Date</option>
            <option value="assise">Assise coupelle</option>
            <option value="axe">Axe coupelle</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as CaleDateFilter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tout</option>
            <option value="day">24 dernières heures</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
            <option value="custom">Personnalisée</option>
          </select>
        </div>
        {dateFilter === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={customDate.start || ''}
                onChange={(e) => setCustomDate({ ...customDate, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={customDate.end || ''}
                onChange={(e) => setCustomDate({ ...customDate, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par assise</label>
          <input
            type="text"
            value={assiseFilter}
            onChange={(e) => setAssiseFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Assise coupelle..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par axe</label>
          <input
            type="text"
            value={axeFilter}
            onChange={(e) => setAxeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Axe coupelle..."
          />
        </div>
      </div>
    </div>
  )
}

export default CaleHistoryFilters 