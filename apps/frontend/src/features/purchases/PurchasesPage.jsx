import React, { useState } from "react";
import { motion } from "framer-motion";
import PremiumModal from "../../components/ui/PremiumModal";
import { Toaster } from "react-hot-toast";
import { 
  Truck, 
  Plus, 
  Clock,
  Sparkles,
  Search
} from "lucide-react";
import CreatePurchaseForm from "./components/CreatePurchaseForm";
import EditPurchaseForm from "./components/EditPurchaseForm";
import PurchaseHistory from "./components/PurchaseHistory";
import { usePurchaseManagement } from "./hooks/usePurchaseManagement";
import { useTranslation } from "react-i18next";

const PurchasesPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    activeTab, setActiveTab,
    purchases, suppliers, isLoading,
    isModalOpen, setIsModalOpen,
    modalType, setModalType,
    selectedPurchase, setSelectedPurchase,
    cursor, setCursor, setCursorsStack,
    handleCreateSupplier, handleCreatePurchase, handleUpdatePurchase,
    pagination
  } = usePurchaseManagement();

  const filteredPurchases = purchases.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(query)) ||
      (p.supplier?.name && p.supplier.name.toLowerCase().includes(query)) ||
      (p.itemName && p.itemName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{t("purchases.procurement", "Procurement")}</h1>
          <p className="text-xs text-slate-500 font-medium">{t("purchases.purchases_subtitle", "Manage your suppliers and purchase logs with auto-inventory sync.")}</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <button 
            onClick={() => {
              setModalType('purchase');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50 max-md:bg-primary-600 max-md:hover:bg-primary-500 max-md:shadow-primary-500/25"
          >
            <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("purchases.new_purchase", "New Purchase")}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder={t("purchases.search_placeholder", "Search by supplier, item or invoice...")}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        <PurchaseHistory 
          purchases={filteredPurchases} 
          isLoading={isLoading} 
          pagination={pagination}
          onEdit={(purchase) => {
            setSelectedPurchase(purchase);
            setModalType('edit_purchase');
            setIsModalOpen(true);
          }}
        />
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'edit_purchase' ? "Edit Purchase" : "Log Purchase"}
        description={modalType === 'edit_purchase' ? "Modify purchase details and update stock." : "Record a new procurement entry and update stock."}
        maxWidth="max-w-3xl"
      >
        {modalType === 'edit_purchase' ? (
          <EditPurchaseForm 
            purchase={selectedPurchase}
            onSubmit={handleUpdatePurchase}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isLoading}
          />
        ) : (
          <CreatePurchaseForm 
            onSubmit={handleCreatePurchase}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isLoading}
          />
        )}
      </PremiumModal>
      <Toaster position="top-right" />
    </div>
  );
};

export default PurchasesPage;
