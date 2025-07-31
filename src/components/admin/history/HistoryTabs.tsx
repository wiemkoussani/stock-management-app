'use client';
import { useState } from 'react';
import HistoryFilters from './HistoryFilters';
import HistoryList from './HistoryList';
import useAdminHistory from '@/lib/hooks/useAdminHistory';
import toast from 'react-hot-toast';

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

const HistoryTabs = () => {
  const [activeTab, setActiveTab] = useState<'entree' | 'sortie'>('sortie');
  const {
    historyItems,
    loading,
    sortBy,
    setSortBy,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    referenceFilter,
    setReferenceFilter,
    referenceOutilFilter,
    setReferenceOutilFilter,
    updateHistoryItem,
    deleteHistoryItem,
    refetch
  } = useAdminHistory(activeTab);

  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editingItem) {
      toast.error('Aucun élément sélectionné');
      return;
    }

    if (!editingItem.reference?.trim()) {
      toast.error('La référence est obligatoire');
      return;
    }

    if (!editingItem.nom_prenom_personne?.trim()) {
      toast.error('Le nom prénom est obligatoire');
      return;
    }

    if (!editingItem.quantite || editingItem.quantite <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }

    if (activeTab === 'sortie' && !(editingItem as HistorySortieItem).activite?.trim()) {
      toast.error('L\'activité est obligatoire');
      return;
    }

    if (!editingItem.date_operation) {
      toast.error('La date d\'opération est obligatoire');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateHistoryItem(editingItem);
      if (result) {
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        [field]: value
      });
    }
  };

  const handleTabChange = (tab: 'entree' | 'sortie') => {
    setActiveTab(tab);
    setEditingItem(null);
  };

  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return new Date().toISOString().slice(0, 16);
    }
  };

  const handleEdit = (item: HistoryItem) => {
    if (!item.id) {
      toast.error('Élément invalide: ID manquant');
      return;
    }
    
    const itemCopy = { ...item };
    
    if (!itemCopy.reference) itemCopy.reference = '';
    if (!itemCopy.nom_prenom_personne) itemCopy.nom_prenom_personne = '';
    if (!itemCopy.quantite) itemCopy.quantite = 1;
    if (!itemCopy.date_operation) itemCopy.date_operation = new Date().toISOString();
    
    if (activeTab === 'sortie' && !(itemCopy as HistorySortieItem).activite) {
      (itemCopy as HistorySortieItem).activite = '';
    }
    
    setEditingItem(itemCopy);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('ID invalide');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await deleteHistoryItem(id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printableElement = document.getElementById('printable-history')?.cloneNode(true) as HTMLElement;
      
      if (printableElement) {
        // Hide action buttons
        const actionCells = printableElement.querySelectorAll('td.no-print');
        actionCells.forEach(cell => {
          (cell as HTMLElement).style.display = 'none';
        });

        // Hide empty header cell for actions column
        const actionHeader = printableElement.querySelector('th:last-child');
        if (actionHeader && actionHeader.textContent?.trim() === 'Actions') {
          (actionHeader as HTMLElement).style.display = 'none';
        }
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Historique ${activeTab === 'sortie' ? 'des Sorties' : 'des Entrées'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
              h1 { color: #2c5282; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .print-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .print-footer { margin-top: 30px; font-size: 12px; text-align: center; }
              .no-print { display: none !important; }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>Historique ${activeTab === 'sortie' ? 'des Sorties' : 'des Entrées'}</h1>
              <div>Généré le: ${new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            ${printableElement?.outerHTML || '<p>Aucune donnée à imprimer</p>'}
            <div class="print-footer">
              <p>© ${new Date().getFullYear()} - Votre Application</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-blue-200">
        <button
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === 'sortie' 
              ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
          }`}
          onClick={() => handleTabChange('sortie')}
          disabled={isSaving}
        >
          Historique Sortie
        </button>
        <button
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === 'entree' 
              ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
          }`}
          onClick={() => handleTabChange('entree')}
          disabled={isSaving}
        >
          Historique Entrée
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
        <HistoryFilters 
          sortBy={sortBy}
          setSortBy={setSortBy}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDate={customDate}
          setCustomDate={setCustomDate}
          referenceFilter={referenceFilter}
          setReferenceFilter={setReferenceFilter}
          referenceOutilFilter={referenceOutilFilter}
          setReferenceOutilFilter={setReferenceOutilFilter}
        />
      </div>

      {editingItem && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-blue-800">Modifier l'élément</h2>
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">ID: {editingItem.id}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... (keep all your existing edit form fields) ... */}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={() => setEditingItem(null)}
              className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-800">
            {activeTab === 'sortie' ? 'Historique des Sorties' : 'Historique des Entrées'}
          </h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm no-print"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
        </div>
        
        <div id="printable-history">
          <HistoryList 
            historyItems={historyItems}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            type={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryTabs; 