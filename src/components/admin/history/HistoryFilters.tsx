'use client'

interface HistoryFiltersProps {
  sortBy: 'date' | 'reference' | 'reference_outil'
  setSortBy: (value: 'date' | 'reference' | 'reference_outil') => void
  dateFilter: 'custom' | 'day' | 'month' | 'year' | 'all'
  setDateFilter: (value: 'custom' | 'day' | 'month' | 'year' | 'all') => void
  customDate: {start?: string, end?: string}
  setCustomDate: (value: {start?: string, end?: string}) => void
  referenceFilter: string
  setReferenceFilter: (value: string) => void
  referenceOutilFilter: string
  setReferenceOutilFilter: (value: string) => void
}

const HistoryFilters = ({
  sortBy,
  setSortBy,
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
  referenceFilter,
  setReferenceFilter,
  referenceOutilFilter,
  setReferenceOutilFilter
}: HistoryFiltersProps) => {
  
  const handleClearFilters = () => {
    setReferenceFilter('');
    setReferenceOutilFilter('');
    setDateFilter('all');
    setCustomDate({});
    setSortBy('date');
  };

  const hasActiveFilters = 
    referenceFilter || 
    referenceOutilFilter || 
    dateFilter !== 'all' || 
    sortBy !== 'date';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtres et Tri</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trier par
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date">Date (plus récent)</option>
            <option value="reference">Référence (A-Z)</option>
            <option value="reference_outil">Référence outil (A-Z)</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Période
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="day">24 dernières heures</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
            <option value="custom">Période personnalisée</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {dateFilter === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={customDate.start || ''}
                onChange={(e) => setCustomDate({ ...customDate, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                max={customDate.end || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={customDate.end || ''}
                onChange={(e) => setCustomDate({ ...customDate, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={customDate.start || ''}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </>
        )}
      </div>

      {/* Text Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrer par référence
          </label>
          <div className="relative">
            <input
              type="text"
              value={referenceFilter}
              onChange={(e) => setReferenceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              placeholder="Rechercher une référence..."
            />
            {referenceFilter && (
              <button
                onClick={() => setReferenceFilter('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrer par référence outil
          </label>
          <div className="relative">
            <input
              type="text"
              value={referenceOutilFilter}
              onChange={(e) => setReferenceOutilFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              placeholder="Rechercher une référence outil..."
            />
            {referenceOutilFilter && (
              <button
                onClick={() => setReferenceOutilFilter('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Filtres actifs:</span>
            <div className="mt-1 space-y-1">
              {dateFilter !== 'all' && (
                <div>• Période: {
                  dateFilter === 'day' ? '24 dernières heures' :
                  dateFilter === 'month' ? '30 derniers jours' :
                  dateFilter === 'year' ? '12 derniers mois' :
                  dateFilter === 'custom' ? `Du ${customDate.start || '...'} au ${customDate.end || '...'}` :
                  'Inconnue'
                }</div>
              )}
              {referenceFilter && <div>• Référence contient: "{referenceFilter}"</div>}
              {referenceOutilFilter && <div>• Référence outil contient: "{referenceOutilFilter}"</div>}
              {sortBy !== 'date' && (
                <div>• Trié par: {
                  sortBy === 'reference' ? 'Référence' :
                  sortBy === 'reference_outil' ? 'Référence outil' :
                  'Date'
                }</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryFilters 