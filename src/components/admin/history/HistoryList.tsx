'use client';

interface HistoryItemBase {
  id: string;
  reference: string;
  reference_outil: string | null;
  emplacement: string | null;
  nom_prenom_personne: string;
  quantite: number;
  date_operation: string;
  created_by?: string;
}

interface HistorySortieItem extends HistoryItemBase {
  activite: string;
}

type HistoryItem = HistoryItemBase | HistorySortieItem;

interface HistoryListProps {
  historyItems: HistoryItem[]
  loading: boolean
  onEdit: (item: HistoryItem) => void
  onDelete: (id: string) => void
  type: 'entree' | 'sortie'
}

const HistoryList = ({ historyItems, loading, onEdit, onDelete, type }: HistoryListProps) => {
  if (loading) {
    return <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    </div>
  }

  if (historyItems.length === 0) {
    return <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center text-gray-500">
        <div className="text-lg mb-2">Aucun élément trouvé</div>
        <div className="text-sm">
          {type === 'sortie' 
            ? 'Aucune sortie ne correspond aux critères de recherche.'
            : 'Aucune entrée ne correspond aux critères de recherche.'
          }
        </div>
      </div>
    </div>
  }

  const getColumns = () => {
    const commonColumns = [
      { key: 'reference', label: 'Référence' },
      { key: 'reference_outil', label: 'Référence outil' },
      { key: 'emplacement', label: 'Emplacement' },
      { key: 'nom_prenom_personne', label: 'Nom Prénom' },
      { key: 'quantite', label: 'Quantité' },
      { key: 'date_operation', label: 'Date opération' }
    ]
        
    if (type === 'sortie') {
      return [...commonColumns, { key: 'activite', label: 'Activité' }]
    }
    return commonColumns
  }

  const formatCellValue = (item: HistoryItem, key: string) => {
    const value = (item as any)[key];
    
    if (key === 'date_operation' && value) {
      try {
        return new Date(value).toLocaleString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return value;
      }
    }
    
    if (key === 'quantite' && value !== null && value !== undefined) {
      return value.toString();
    }
    
    return value || '-';
  }

  const handleEditClick = (item: HistoryItem) => {
    if (!item.id) {
      console.error('Item missing ID:', item);
      return;
    }
    onEdit(item);
  };

  const handleDeleteClick = (item: HistoryItem) => {
    if (!item.id) {
      console.error('Item missing ID:', item);
      return;
    }
    onDelete(item.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {getColumns().map(column => (
                <th 
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historyItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {getColumns().map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCellValue(item, column.key)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 no-print">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Modifier cet élément"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Supprimer cet élément"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <div>
            <span className="font-medium">{historyItems.length}</span>
            {' '}
            {historyItems.length === 1 
              ? (type === 'sortie' ? 'sortie trouvée' : 'entrée trouvée')
              : (type === 'sortie' ? 'sorties trouvées' : 'entrées trouvées')
            }
          </div>
          <div className="text-xs text-gray-500">
            Dernière mise à jour: {new Date().toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryList; 