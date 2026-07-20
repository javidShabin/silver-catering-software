import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { inventoryApi } from "../../../api/inventoryApi";
import { categoryApi } from "../../../api/inventoryCategoryApi";
import { useFilterStore } from "../../../store/useFilterStore";
import { useModalStore } from "../../../store/useModalStore";
import { useViewStore } from "../../../store/useViewStore";
import { useDebounce } from "../../../hooks/useDebounce";

export const useInventoryManagement = () => {
  const queryClient = useQueryClient();
  const setToast = (data) => { if (!data) return; if (data.type === 'error') toast.error(data.message); else toast.success(data.message); };

  // Zustand State Management
  const viewMode = useViewStore(state => state.inventoryViewMode);
  const setViewStoreMode = useViewStore(state => state.setViewMode);
  const setViewMode = useCallback((mode) => setViewStoreMode('inventory', mode), [setViewStoreMode]);
  
  const { search, category, cursor, cursorsStack } = useFilterStore(state => state.filters.inventory);
  const setFilter = useFilterStore(state => state.setFilter);
  
  const { isOpen: isModalOpen, isDeleteOpen: isDeleteModalOpen, selectedItem } = useModalStore(state => state.modals.inventory);
  const openModal = useModalStore(state => state.openModal);
  const closeModal = useModalStore(state => state.closeModal);

  const { data: categoriesData } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const fetchedCategories = categoriesData?.data?.data?.map(c => c.name) || [];
  const categories = ["All", ...fetchedCategories];

  const debouncedSearch = useDebounce(search, 500);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', debouncedSearch, category, cursor],
    queryFn: () => inventoryApi.getAll({ search: debouncedSearch, category, cursor, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const items = inventoryData?.data || [];
  const nextCursor = inventoryData?.nextCursor || null;
  const hasNextPage = !!nextCursor;
  const hasPreviousPage = cursorsStack?.length > 0;

  const stockMutation = useMutation({
    mutationFn: ({ id, amount, type }) => inventoryApi.updateStock(id, amount, type),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setToast({ message: `Stock ${variables.type === 'add' ? 'increased' : 'decreased'} successfully`, type: 'success' });
    },
    onError: (err) => setToast({ message: err.response?.data?.message || "Failed to update stock", type: 'error' })
  });

  const handleUpdateStock = useCallback((item, type) => {
    stockMutation.mutate({ id: item.id, amount: 1, type });
  }, [stockMutation]);

  const handleSearch = useCallback((value) => {
    setFilter('inventory', { search: value, cursor: null, cursorsStack: [] });
  }, [setFilter]);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setFilter('inventory', { 
        cursor: nextCursor, 
        cursorsStack: [...(cursorsStack || []), cursor] 
      });
    }
  }, [hasNextPage, nextCursor, cursor, cursorsStack, setFilter]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      const newStack = [...(cursorsStack || [])];
      const previousCursor = newStack.pop();
      setFilter('inventory', { 
        cursor: previousCursor, 
        cursorsStack: newStack 
      });
    }
  }, [hasPreviousPage, cursorsStack, setFilter]);

  const handleEditModal = useCallback((item) => openModal('inventory', false, item), [openModal]);
  const handleDeleteModal = useCallback((item) => openModal('inventory', true, item), [openModal]);

  const createMutation = useMutation({
    mutationFn: (formData) => inventoryApi.create(formData),
    onSuccess: () => {
      setToast({ message: "Item added to inventory", type: "success" });
      closeModal('inventory');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err) => setToast({ message: err.response?.data?.message || "Failed to add item", type: "error" })
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => inventoryApi.update(selectedItem.id, formData),
    onSuccess: () => {
      setToast({ message: "Inventory item updated", type: "success" });
      closeModal('inventory');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => setToast({ message: "Failed to update item", type: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: () => inventoryApi.delete(selectedItem.id),
    onSuccess: () => {
      setToast({ message: "Item deleted successfully", type: "success" });
      closeModal('inventory');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => setToast({ message: "Failed to delete item", type: "error" })
  });

  const handleCreateItem = (formData) => createMutation.mutate(formData);
  const handleUpdateItem = (formData) => updateMutation.mutate(formData);
  const handleDeleteItem = () => deleteMutation.mutate();

  return {
    viewMode, setViewMode,
    items, isLoading, categories,
    category, setFilter,
    isModalOpen, isDeleteModalOpen, selectedItem,
    closeModal, openModal,
    handleSearch, handleEditModal, handleDeleteModal,
    handleUpdateStock, handleCreateItem, handleUpdateItem, handleDeleteItem,
    updateMutation, createMutation, deleteMutation,
    pagination: { hasNextPage, hasPreviousPage, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage }
  };
};
