import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { eventApi } from "../../../api/eventApi";
import { useViewStore } from "../../../store/useViewStore";
import { useFilterStore } from "../../../store/useFilterStore";
import { useModalStore } from "../../../store/useModalStore";
import { playActionSound } from "../../../utils/sound";

export const useEvents = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToast = (data) => { if (!data) return; if (data.type === 'error') toast.error(data.message); else toast.success(data.message); };

  // Zustand State Management
  const viewMode = useViewStore(state => state.eventsViewMode);
  const setViewMode = useViewStore(state => state.setViewMode);

  const params = useFilterStore(state => state.filters.events);
  const setFilter = useFilterStore(state => state.setFilter);
  const resetFilter = useFilterStore(state => state.resetFilter);

  const { isOpen: isModalOpen, selectedItem: selectedEvent } = useModalStore(state => state.modals.events);
  const openModal = useModalStore(state => state.openModal);
  const closeModal = useModalStore(state => state.closeModal);

  // Server State Management
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', params],
    queryFn: () => eventApi.getAll({ ...params }),
    placeholderData: keepPreviousData,
  });

  const events = eventsData?.data || [];
  const nextCursor = eventsData?.nextCursor || null;
  const hasNextPage = !!nextCursor;
  const hasPreviousPage = params.cursorsStack.length > 0;

  // Handlers
  const handleSearch = useCallback((value) => {
    setFilter('events', { search: value, cursor: null, cursorsStack: [] });
  }, [setFilter]);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setFilter('events', {
        cursor: nextCursor,
        cursorsStack: [...params.cursorsStack, params.cursor]
      });
    }
  }, [hasNextPage, nextCursor, params.cursor, params.cursorsStack, setFilter]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      const newStack = [...params.cursorsStack];
      const previousCursor = newStack.pop();
      setFilter('events', {
        cursor: previousCursor,
        cursorsStack: newStack
      });
    }
  }, [hasPreviousPage, params.cursorsStack, setFilter]);

  const clearFilters = useCallback(() => {
    resetFilter('events');
  }, [resetFilter]);

  const handleViewEvent = useCallback((event) => {
    navigate(`/events/${event.id}`);
  }, [navigate]);

  const handleEditEvent = useCallback((event) => {
    console.log("Edit", event.id);
  }, []);

  const [eventToDelete, setEventToDelete] = useState(null);
  const [statusUpdateEvent, setStatusUpdateEvent] = useState(null);

  const handleDeleteEvent = useCallback((event) => {
    setEventToDelete(event);
  }, []);

  const handleStatusUpdateEvent = useCallback((event) => {
    setStatusUpdateEvent(event);
  }, []);

  const cancelDelete = useCallback(() => {
    setEventToDelete(null);
  }, []);

  const cancelStatusUpdate = useCallback(() => {
    setStatusUpdateEvent(null);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id) => eventApi.delete(id),
    onSuccess: () => {
      setToast({ message: "Event removed successfully!", type: "success" });
      setEventToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error("Failed to delete event:", error);
      setToast({
        message: error.response?.data?.message || "Failed to delete event. Please try again.",
        type: "error"
      });
    }
  });

  const confirmDelete = useCallback(() => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id);
    }
  }, [eventToDelete, deleteMutation]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => eventApi.update(id, data),
    onSuccess: () => {
      playActionSound('success');
      setToast({ message: "Event status updated successfully!", type: "success" });
      setStatusUpdateEvent(null);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error("Failed to update status:", error);
      setToast({
        message: error.response?.data?.message || "Failed to update status. Please try again.",
        type: "error"
      });
    }
  });

  const confirmUpdateStatus = useCallback((newStatus) => {
    if (statusUpdateEvent) {
      updateStatusMutation.mutate({ id: statusUpdateEvent.id, data: { status: newStatus } });
    }
  }, [statusUpdateEvent, updateStatusMutation]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => eventApi.create(formData),
    onSuccess: () => {
      setToast({ message: "Event scheduled successfully!", type: "success" });
      closeModal('events');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
      setToast({
        message: error.response?.data?.message || "Failed to schedule event. Please try again.",
        type: "error"
      });
    }
  });

  const handleCreateEvent = (formData) => {
    createMutation.mutate(formData);
  };

  return {
    // Data
    events,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    // State
    params,
    viewMode,
    isModalOpen,
    selectedEvent,
    isCreating: createMutation.isPending,
    // Actions
    setViewMode,
    setFilter,
    handleSearch,
    handleNextPage,
    handlePreviousPage,
    clearFilters,
    openModal,
    closeModal,
    handleViewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleStatusUpdateEvent,
    handleCreateEvent,
    eventToDelete,
    statusUpdateEvent,
    cancelDelete,
    cancelStatusUpdate,
    confirmDelete,
    confirmUpdateStatus,
    isDeleting: deleteMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending
  };
};
