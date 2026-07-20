import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useFilterStore } from "../../../store/useFilterStore";
import { useModalStore } from "../../../store/useModalStore";
import { staffApi } from "../../../api/staffApi";
import { toast } from 'react-hot-toast';
import { useDebounce } from "../../../hooks/useDebounce";

export const useStaffManagement = () => {
  const queryClient = useQueryClient();
  const setToast = (data) => { if (!data) return; if (data.type === 'error') toast.error(data.message); else toast.success(data.message); };

  // Zustand State Management
  const { search, roleFilter, cursor, cursorsStack } = useFilterStore(state => state.filters.staff);
  const setFilter = useFilterStore(state => state.setFilter);

  const { isOpen: isModalOpen, isDeleteOpen: isDeleteModalOpen, selectedItem: selectedStaff } = useModalStore(state => state.modals.staff);
  const openModal = useModalStore(state => state.openModal);
  const closeModal = useModalStore(state => state.closeModal);

  // Adapters for existing component props
  const setSearch = (val) => setFilter('staff', { search: val, cursor: null, cursorsStack: [] });
  const setRoleFilter = (val) => setFilter('staff', { roleFilter: val, cursor: null, cursorsStack: [] });

  const setIsModalOpen = (isOpen) => {
    const currentStaff = useModalStore.getState().modals.staff.selectedItem;
    if (isOpen) openModal('staff', false, currentStaff);
    else closeModal('staff');
  };

  const setIsDeleteModalOpen = (isOpen) => {
    const currentStaff = useModalStore.getState().modals.staff.selectedItem;
    if (isOpen) openModal('staff', true, currentStaff);
    else closeModal('staff');
  };

  const setSelectedStaff = (staff) => {
    const isDelete = useModalStore.getState().modals.staff.isDeleteOpen;
    openModal('staff', isDelete, staff);
  };

  const debouncedSearch = useDebounce(search, 500);

  const { data: staffData, isLoading, isFetching } = useQuery({
    queryKey: ['staff', roleFilter, debouncedSearch, cursor],
    queryFn: () => staffApi.getAll({
      role: roleFilter,
      search: debouncedSearch,
      cursor,
      limit: 12
    }),
    placeholderData: keepPreviousData,
  });

  const staff = staffData?.data || [];
  const nextCursor = staffData?.nextCursor || null;
  const hasNextPage = !!nextCursor;
  const hasPreviousPage = cursorsStack?.length > 0;

  const handleNextPage = () => {
    if (hasNextPage) {
      setFilter('staff', {
        cursor: nextCursor,
        cursorsStack: [...(cursorsStack || []), cursor]
      });
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      const newStack = [...(cursorsStack || [])];
      const previousCursor = newStack.pop();
      setFilter('staff', {
        cursor: previousCursor,
        cursorsStack: newStack
      });
    }
  };

  const addMutation = useMutation({
    mutationFn: ({ formData }) => staffApi.create(formData),
    onSuccess: (data, variables) => {
      setToast({ message: "Staff member onboarded successfully", type: "success" });
      if (!variables.addAnother) {
        closeModal('staff');
      }
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || "Failed to onboard staff", type: "error" });
    }
  });

  const handleAddStaff = (formData, addAnother) => {
    addMutation.mutate({ formData, addAnother });
  };

  const updateMutation = useMutation({
    mutationFn: (formData) => staffApi.update(selectedStaff.id, formData),
    onSuccess: () => {
      setToast({ message: "Staff member updated successfully", type: "success" });
      closeModal('staff');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || "Failed to update staff", type: "error" });
    }
  });

  const handleUpdateStaff = (formData) => updateMutation.mutate(formData);

  const deleteMutation = useMutation({
    mutationFn: () => staffApi.delete(selectedStaff.id),
    onSuccess: () => {
      setToast({ message: "Staff member removed successfully", type: "success" });
      closeModal('staff');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: () => {
      setToast({ message: "Failed to delete staff member", type: "error" });
    }
  });

  const handleDeleteStaff = () => deleteMutation.mutate();

  // For compatibility with StaffHeader.jsx that passes setPagination(1)
  const setPagination = (val) => {
    setFilter('staff', { cursor: null, cursorsStack: [] });
  };

  return {
    staff, isLoading: isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    search, setSearch,
    roleFilter, setRoleFilter,
    isModalOpen, setIsModalOpen,
    isDeleteModalOpen, setIsDeleteModalOpen,
    selectedStaff, setSelectedStaff,
    pagination: { hasNextPage, hasPreviousPage, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage },
    setPagination,
    handleAddStaff, handleUpdateStaff, handleDeleteStaff
  };
};
