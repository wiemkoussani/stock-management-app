import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

type SortBy = 'date' | 'reference' | 'reference_outil';
type DateFilter = 'custom' | 'day' | 'month' | 'year' | 'all';

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

const useAdminHistory = (type: 'entree' | 'sortie' = 'sortie') => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDate, setCustomDate] = useState<{start?: string, end?: string}>({});
  const [referenceFilter, setReferenceFilter] = useState('');
  const [referenceOutilFilter, setReferenceOutilFilter] = useState('');

  const getTableName = () => {
    return type === 'entree' ? 'historique_entree' : 'historique';
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const tableName = getTableName();
      let query = supabase
        .from(tableName)
        .select('*');

      // Date filtering
      if (dateFilter !== 'all') {
        let fromDate: Date | undefined;
        let toDate: Date | undefined;

        if (dateFilter === 'custom' && customDate.start && customDate.end) {
          fromDate = new Date(customDate.start);
          toDate = new Date(customDate.end);
          // Définir l'heure de fin à 23:59:59 pour inclure toute la journée
          toDate.setHours(23, 59, 59, 999);
        } else {
          const now = new Date();
          fromDate = new Date();

          if (dateFilter === 'day') {
            fromDate.setDate(now.getDate() - 1);
          } else if (dateFilter === 'month') {
            fromDate.setMonth(now.getMonth() - 1);
          } else if (dateFilter === 'year') {
            fromDate.setFullYear(now.getFullYear() - 1);
          }
        }

        if (fromDate) {
          query = query.gte('date_operation', fromDate.toISOString());
        }
        if (toDate) {
          query = query.lte('date_operation', toDate.toISOString());
        }
      }

      // Reference filtering
      if (referenceFilter.trim()) {
        query = query.ilike('reference', `%${referenceFilter.trim()}%`);
      }

      // Reference outil filtering
      if (referenceOutilFilter.trim()) {
        query = query.ilike('reference_outil', `%${referenceOutilFilter.trim()}%`);
      }

      // Sorting
      if (sortBy === 'date') {
        query = query.order('date_operation', { ascending: false });
      } else if (sortBy === 'reference') {
        query = query.order('reference', { ascending: true });
      } else if (sortBy === 'reference_outil') {
        query = query.order('reference_outil', { ascending: true, nullsFirst: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      setHistoryItems(data || []);
    } catch (error: unknown) {
      console.error('Error fetching history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateHistoryItem = async (item: HistoryItem) => {
    if (!item?.id) {
      toast.error('Élément invalide');
      return;
    }

    // Validation des champs obligatoires
    if (!item.reference?.trim()) {
      toast.error('La référence est obligatoire');
      return;
    }

    if (!item.nom_prenom_personne?.trim()) {
      toast.error('Le nom prénom est obligatoire');
      return;
    }

    if (!item.quantite || item.quantite <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }

    if (type === 'sortie' && !(item as HistorySortieItem).activite?.trim()) {
      toast.error('L\'activité est obligatoire pour les sorties');
      return;
    }

    try {
      const tableName = getTableName();
      
      // Préparer les données à mettre à jour
      const updateData: any = {
        reference: item.reference.trim(),
        reference_outil: item.reference_outil?.trim() || null,
        emplacement: item.emplacement?.trim() || null,
        nom_prenom_personne: item.nom_prenom_personne.trim(),
        quantite: Number(item.quantite),
        date_operation: item.date_operation
      };

      // Ajouter l'activité pour les sorties
      if (type === 'sortie') {
        updateData.activite = (item as HistorySortieItem).activite?.trim() || '';
      }

      console.log('Updating item with ID:', item.id);
      console.log('Update data:', updateData);

      // Effectuer la mise à jour avec .select() pour récupérer les données
      const { data, error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', item.id)
        .select('*');

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Update response:', data);

      // Vérifier si des données ont été retournées
      if (!data || data.length === 0) {
        // Si pas de données retournées, essayer de récupérer l'élément mis à jour
        const { data: fetchedData, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', item.id)
          .single();

        if (fetchError) {
          console.error('Fetch after update error:', fetchError);
          throw new Error('Élément non trouvé après la mise à jour');
        }

        if (!fetchedData) {
          throw new Error('Impossible de récupérer l\'élément mis à jour');
        }

        // Mettre à jour l'état local avec les données récupérées
        setHistoryItems(prevItems => 
          prevItems.map(i => i.id === item.id ? fetchedData : i)
        );

        toast.success('Modification enregistrée avec succès');
        return fetchedData;
      }

      if (data.length > 1) {
        console.warn('Multiple rows updated, using first one');
      }

      const updatedItem = data[0];

      // Mettre à jour l'état local immédiatement
      setHistoryItems(prevItems => 
        prevItems.map(i => i.id === item.id ? updatedItem : i)
      );

      toast.success('Modification enregistrée avec succès');
      return updatedItem;
    } catch (error: unknown) {
      let errorMessage = 'Erreur lors de la modification';
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage += `: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      console.error('Update error details:', error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!id) {
      toast.error('ID invalide');
      return;
    }
    
    try {
      const tableName = getTableName();
      
      console.log('Deleting item with ID:', id);

      const { error, data } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .select('id'); // Sélectionner au moins l'ID pour confirmer la suppression

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Delete response:', data);

      // Vérifier si la suppression a eu lieu
      if (!data || data.length === 0) {
        // L'élément pourrait déjà avoir été supprimé ou ne pas exister
        console.warn('No data returned from delete operation for ID:', id);
      }

      // Mettre à jour l'état local immédiatement
      setHistoryItems(prevItems => prevItems.filter(item => item.id !== id));
      toast.success('Élément supprimé avec succès');
    } catch (error: unknown) {
      console.error('Delete error:', error);
      
      let errorMessage = 'Erreur lors de la suppression';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [type, sortBy, dateFilter, customDate, referenceFilter, referenceOutilFilter]);

  return {
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
    refetch: fetchHistory
  };
};

export default useAdminHistory; 