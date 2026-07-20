import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { purchaseApi } from "../../../api/purchaseApi";
import { toast } from 'react-hot-toast';

export const usePurchaseManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("history");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("purchase"); // 'purchase', 'supplier', or 'edit_purchase'
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const setToast = (data) => { if (!data) return; if (data.type === 'error') toast.error(data.message); else toast.success(data.message); };
  
  const [cursor, setCursor] = useState(null);
  const [cursorsStack, setCursorsStack] = useState([]);
  const hasPreviousPage = cursorsStack.length > 0;

  const { data: purchasesData, isLoading: isPurchasesLoading } = useQuery({
    queryKey: ['purchases', { cursor }],
    queryFn: () => purchaseApi.getAllPurchases({ cursor, limit: 10 }),
    enabled: activeTab === 'history',
    placeholderData: keepPreviousData,
  });

  const { data: suppliersData, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => purchaseApi.getAllSuppliers(),
    enabled: activeTab === 'suppliers',
  });

  const purchases = purchasesData?.data || [];
  const nextCursor = purchasesData?.nextCursor || null;
  const hasNextPage = !!nextCursor;

  const suppliers = suppliersData?.data || [];

  const isLoading = (activeTab === 'history' ? isPurchasesLoading : isSuppliersLoading);

  const createSupplierMutation = useMutation({
    mutationFn: (formData) => purchaseApi.createSupplier(formData),
    onSuccess: () => {
      setToast({ message: "Supplier registered successfully", type: "success" });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || "Registration failed", type: "error" });
    }
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (formData) => {
      if (Array.isArray(formData)) {
        return Promise.all(formData.map(data => purchaseApi.createPurchase(data)));
      } else {
        return purchaseApi.createPurchase(formData);
      }
    },
    onSuccess: (_, variables) => {
      const message = Array.isArray(variables) 
        ? `${variables.length} items purchased and stock updated!`
        : "Purchase recorded and stock updated!";
      setToast({ message, type: "success" });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || "Failed to log purchase", type: "error" });
    }
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: ({ id, data }) => purchaseApi.updatePurchase(id, data),
    onSuccess: () => {
      setToast({ message: "Purchase updated successfully!", type: "success" });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || "Failed to update purchase", type: "error" });
    }
  });

  const handleNextPage = () => {
    if (hasNextPage) {
      setCursorsStack([...cursorsStack, cursor]);
      setCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      const newStack = [...cursorsStack];
      const previousCursor = newStack.pop();
      setCursorsStack(newStack);
      setCursor(previousCursor);
    }
  };

  const handleCreateSupplier = (formData) => {
    createSupplierMutation.mutate(formData);
  };

  const handleCreatePurchase = (formData) => {
    createPurchaseMutation.mutate(formData);
  };

  const handleUpdatePurchase = (id, formData, extraItems = []) => {
    updatePurchaseMutation.mutate({ id, data: formData });
    if (extraItems && extraItems.length > 0) {
      createPurchaseMutation.mutate(extraItems);
    }
  };

  return {
    activeTab, setActiveTab,
    purchases, suppliers, isLoading,
    isModalOpen, setIsModalOpen,
    modalType, setModalType,
    selectedPurchase, setSelectedPurchase,
    cursor, setCursor, setCursorsStack,
    handleCreateSupplier, handleCreatePurchase, handleUpdatePurchase,
    pagination: { hasNextPage, hasPreviousPage, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage }
  };
};
