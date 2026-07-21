import React from "react";
import { motion } from "framer-motion";
import PremiumModal from "../../components/ui/PremiumModal";
import { Toaster } from "react-hot-toast";
import { 
  Truck, 
  Plus, 
  Clock,
  Sparkles
} from "lucide-react";
import CreatePurchaseForm from "./components/CreatePurchaseForm";
import EditPurchaseForm from "./components/EditPurchaseForm";
import PurchaseHistory from "./components/PurchaseHistory";
import { usePurchaseManagement } from "./hooks/usePurchaseManagement";
import { useTranslation } from "react-i18next";

const PurchasesPage = () => {
  const { t } = useTranslation();
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

  const tabs = [
    { id: 'history', label: t("purchases.purchase_history", "Purchase History"), icon: Clock },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-1">

          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{t("purchases.procurement", "Procurement")}</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-md mx-auto lg:mx-0">{t("purchases.purchases_subtitle", "Manage your suppliers and purchase logs with auto-inventory sync.")}</p>
        </div>
        
        <div className="w-full flex justify-center lg:w-auto">
          <button 
            onClick={() => {
              setModalType('purchase');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50"
          >
            <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("purchases.new_purchase", "New Purchase")}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCursor(null); setCursorsStack([]); }}
            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        <PurchaseHistory 
          purchases={purchases} 
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
