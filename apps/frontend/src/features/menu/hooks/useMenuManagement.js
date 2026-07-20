import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { menuApi } from "../../../api/menuApi";
import { menuCategoryApi } from "../../../api/menuCategoryApi";
import { useFilterStore } from "../../../store/useFilterStore";
import { useModalStore } from "../../../store/useModalStore";
import { useViewStore } from "../../../store/useViewStore";

export const useMenuManagement = () => {
  const queryClient = useQueryClient();
  
  // Zustand State Management
  const viewMode = useViewStore(state => state.menuViewMode);
  const setViewStoreMode = useViewStore(state => state.setViewMode);
  const setViewMode = useCallback((mode) => setViewStoreMode('menu', mode), [setViewStoreMode]);
  
  const { search, category, cursor, cursorsStack } = useFilterStore(state => state.filters.menu);
  const setFilter = useFilterStore(state => state.setFilter);
  
  const { isOpen: isModalOpen, isDeleteOpen: isDeleteModalOpen, selectedItem, isCategoryOpen: isCategoryModalOpen } = useModalStore(state => state.modals.menu);
  const openModal = useModalStore(state => state.openModal);
  const closeModal = useModalStore(state => state.closeModal);

  const { data: menuCategoriesData } = useQuery({
    queryKey: ['menuCategories'],
    queryFn: menuCategoryApi.getAll
  });

  const dbCategories = menuCategoriesData?.data?.map(c => c.name) || [];
  const categories = ["All", ...dbCategories];

  // Server State Management
  const { data: menuData, isLoading } = useQuery({
    queryKey: ['menu', search, category, cursor],
    queryFn: () => menuApi.getAll({ search, category, cursor, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const items = menuData?.data || [];
  const nextCursor = menuData?.nextCursor || null;
  const hasNextPage = !!nextCursor;
  const hasPreviousPage = cursorsStack?.length > 0;

  const handleSearch = useCallback((value) => {
    setFilter('menu', { search: value, cursor: null, cursorsStack: [] });
  }, [setFilter]);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setFilter('menu', { 
        cursor: nextCursor, 
        cursorsStack: [...(cursorsStack || []), cursor] 
      });
    }
  }, [hasNextPage, nextCursor, cursor, cursorsStack, setFilter]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      const newStack = [...(cursorsStack || [])];
      const previousCursor = newStack.pop();
      setFilter('menu', { 
        cursor: previousCursor, 
        cursorsStack: newStack 
      });
    }
  }, [hasPreviousPage, cursorsStack, setFilter]);

  const handleEditModal = useCallback((item) => openModal('menu', false, item), [openModal]);
  const handleDeleteModal = useCallback((item) => openModal('menu', true, item), [openModal]);
  const handleCategoryModal = useCallback(() => openModal('menu', false, null, true), [openModal]);

  const createMutation = useMutation({
    mutationFn: (formData) => menuApi.create(formData),
    onSuccess: () => {
      toast.success("Dish added to culinary directory");
      closeModal('menu');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add dish")
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => menuApi.update(selectedItem.id, formData),
    onSuccess: () => {
      toast.success("Dish updated successfully");
      closeModal('menu');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: () => toast.error("Failed to update dish")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => menuApi.delete(id),
    onSuccess: () => {
      toast.success("Dish removed from directory");
      closeModal('menu');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: () => toast.error("Failed to delete item")
  });

  const handleCreateItem = (formData) => createMutation.mutate(formData);
  const handleUpdateItem = (formData) => updateMutation.mutate(formData);

  return {
    viewMode, setViewMode,
    items, isLoading, categories, dbCategories,
    category, setFilter,
    isModalOpen, isDeleteModalOpen, selectedItem, isCategoryModalOpen,
    closeModal, openModal,
    handleSearch, handleEditModal, handleDeleteModal, handleCategoryModal,
    handleCreateItem, handleUpdateItem,
    updateMutation, createMutation, deleteMutation,
    pagination: { hasNextPage, hasPreviousPage, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage }
  };
};
