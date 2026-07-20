import { CURRENCY } from "../../../config/currency";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { billingApi } from "../../../api/billingApi";
import { toast } from 'react-hot-toast';
import { useDebounce } from "../../../hooks/useDebounce";

export const useBillingManagement = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setToast = (data) => { if (!data) return; if (data.type === 'error') toast.error(data.message); else toast.success(data.message); };
  
  // Invoice Preview State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [cursor, setCursor] = useState(null);
  const [cursorsStack, setCursorsStack] = useState([]);
  const hasPreviousPage = cursorsStack.length > 0;

  const debouncedSearch = useDebounce(search, 500);

  // Reset pagination when debounced search changes
  useEffect(() => {
    setCursor(null);
    setCursorsStack([]);
  }, [debouncedSearch]);

  const { data: billingData, isLoading: isFetchingInvoices } = useQuery({
    queryKey: ['invoices', { status: statusFilter, search: debouncedSearch, cursor }],
    queryFn: () => billingApi.getAll({ status: statusFilter, search: debouncedSearch, cursor, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const { data: statsData, isLoading: isFetchingStats } = useQuery({
    queryKey: ['billingStats', { status: statusFilter, search: debouncedSearch }],
    queryFn: () => billingApi.getStats({ status: statusFilter, search: debouncedSearch }),
  });

  const invoices = billingData?.data || [];
  const nextCursor = billingData?.nextCursor || null;
  const hasNextPage = !!nextCursor;
  
  const stats = statsData?.data || { total: 0, received: 0, pending: 0 };
  const isLoading = isFetchingInvoices || isFetchingStats;

  const createInvoiceMutation = useMutation({
    mutationFn: (formData) => billingApi.create(formData),
    onSuccess: () => {
      setToast({ message: "Invoice generated successfully", type: "success" });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billingStats'] });
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || "Failed to create invoice", type: "error" });
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

  const handleCreateInvoice = async (formData) => {
    createInvoiceMutation.mutate(formData);
  };

  const handlePreviewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handleWhatsAppShare = (invoice) => {
    if (!invoice?.customer?.phone) {
      setToast({ message: "No phone number registered for this client.", type: "error" });
      return;
    }
    const shareUrl = `${window.location.origin}/billing?search=${encodeURIComponent(invoice?.invoiceNumber)}`;
    
    const phone = invoice.customer.phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Hello ${invoice.customer.name},\n\nHere are the details of your invoice (${invoice.invoiceNumber}) for the upcoming event.\n\nTotal Amount: {CURRENCY}${invoice.totalAmount.toLocaleString()}\nBalance Due: {CURRENCY}${invoice.balanceAmount.toLocaleString()}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n🔗 *View Invoice:* \n${shareUrl}\n\nThank you for choosing DoCaterPro!`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return {
    invoices, isLoading, search, setSearch,
    statusFilter, setStatusFilter, cursor, setCursor, setCursorsStack,
    isModalOpen, setIsModalOpen,
    selectedInvoice, isPreviewOpen, setIsPreviewOpen,
    stats,
    handleCreateInvoice, handlePreviewInvoice, handleWhatsAppShare,
    pagination: { hasNextPage, hasPreviousPage, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage }
  };
};
