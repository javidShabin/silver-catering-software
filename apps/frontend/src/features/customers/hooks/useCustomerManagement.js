import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { customerApi } from "../../../api/customerApi";
import { useFilterStore } from "../../../store/useFilterStore";
import { useModalStore } from "../../../store/useModalStore";
import { useViewStore } from "../../../store/useViewStore";

export const useCustomerManagement = () => {
  const queryClient = useQueryClient();
  
  // Zustand State Management
  const viewMode = useViewStore(state => state.customersViewMode);
  const setViewMode = useViewStore(state => state.setViewMode);
  
  const { search, cursor, cursorsStack } = useFilterStore(state => state.filters.customers);
  const setFilter = useFilterStore(state => state.setFilter);
  
  const { isOpen: isModalOpen, isDeleteOpen: isDeleteModalOpen, selectedItem: selectedCustomer } = useModalStore(state => state.modals.customers);
  const openModal = useModalStore(state => state.openModal);
  const closeModal = useModalStore(state => state.closeModal);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', search, cursor],
    queryFn: () => customerApi.getAll({ search, cursor, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const customers = customersData?.data || [];
  const nextCursor = customersData?.nextCursor || null;
  const hasNextPage = !!nextCursor;
  const hasPreviousPage = cursorsStack?.length > 0;

  const updateMutation = useMutation({
    mutationFn: (formData) => customerApi.update(selectedCustomer.id, formData),
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      closeModal('customers');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update customer");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => customerApi.delete(selectedCustomer.id),
    onSuccess: () => {
      toast.success("Customer deleted successfully!");
      closeModal('customers');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete customer");
    }
  });

  const createMutation = useMutation({
    mutationFn: (formData) => customerApi.create(formData),
    onSuccess: () => {
      toast.success("Customer created successfully!");
      closeModal('customers');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create customer");
    }
  });

  const handleUpdateCustomer = (formData) => updateMutation.mutate(formData);
  const handleDeleteCustomer = () => deleteMutation.mutate();
  const handleCreateCustomer = (formData) => createMutation.mutate(formData);

  const handleSearch = useCallback((value) => {
    setFilter('customers', { search: value, cursor: null, cursorsStack: [] });
  }, [setFilter]);

  const handleEditModal = useCallback((customer) => openModal('customers', false, customer), [openModal]);
  const handleDeleteModal = useCallback((customer) => openModal('customers', true, customer), [openModal]);
  const handleViewModal = useCallback(() => {}, []);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setFilter('customers', { 
        cursor: nextCursor, 
        cursorsStack: [...(cursorsStack || []), cursor] 
      });
    }
  }, [hasNextPage, nextCursor, cursor, cursorsStack, setFilter]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      const newStack = [...(cursorsStack || [])];
      const previousCursor = newStack.pop();
      setFilter('customers', { 
        cursor: previousCursor, 
        cursorsStack: newStack 
      });
    }
  }, [hasPreviousPage, cursorsStack, setFilter]);

  return {
    viewMode, setViewMode,
    customers, isLoading,
    isModalOpen, isDeleteModalOpen, selectedCustomer,
    closeModal, openModal,
    handleSearch, handleEditModal, handleDeleteModal, handleViewModal,
    handleUpdateCustomer, handleDeleteCustomer, handleCreateCustomer,
    updateMutation, deleteMutation, createMutation,
    pagination: { hasNextPage, hasPreviousPage, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage }
  };
};
