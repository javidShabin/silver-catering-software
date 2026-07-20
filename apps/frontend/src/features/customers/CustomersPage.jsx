import React from "react";
import DebouncedSearchInput from "../../components/ui/DebouncedSearchInput";
import PremiumModal from "../../components/ui/PremiumModal";
import { Toaster } from "react-hot-toast";
import { Users, LayoutGrid, List, UserPlus, MessageSquare } from "lucide-react";
import CreateCustomerForm from "./components/CreateCustomerForm";
import ConfirmModal from "../../components/ui/ConfirmModal";
import TableActions from "../../components/ui/table/TableActions";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton, GridSkeleton } from "../../components/ui/Skeleton";
import CustomerCard from "./components/CustomerCard";
import { useCustomerManagement } from "./hooks/useCustomerManagement";
import { useTranslation } from "react-i18next";

import { billingApi } from "../../api/billingApi";

const CustomersPage = () => {
  const { t } = useTranslation();
  const [overdueCustomerIds, setOverdueCustomerIds] = React.useState([]);

  React.useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const res = await billingApi.getOverdueCount();
        if (res.status === "success") {
          setOverdueCustomerIds(res.data.customerIds || []);
        }
      } catch (error) {
        console.error("Failed to fetch overdue customer ids:", error);
      }
    };
    fetchOverdue();
  }, []);

  const {
    viewMode, setViewMode,
    customers, isLoading,
    isModalOpen, isDeleteModalOpen, selectedCustomer,
    closeModal, openModal,
    handleSearch, handleEditModal, handleDeleteModal, handleViewModal,
    handleUpdateCustomer, handleDeleteCustomer, handleCreateCustomer,
    updateMutation, deleteMutation, createMutation,
    pagination
  } = useCustomerManagement();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("customers.customers", "Customer Directory")}</h1>
          <p className="text-sm text-slate-500">{t("customers.customers_subtitle", "Manage your client relationships and history.")}</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <div className="hidden sm:flex bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary-600' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-primary-600' : 'text-slate-400'}`}><List size={16} /></button>
          </div>
          <div className="w-full flex justify-center sm:w-auto">
            <button 
              onClick={() => openModal('customers', false, null)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50"
            >
              <UserPlus className="w-3.5 h-3.5 max-md:w-6 max-md:h-6" /> 
              <span className="max-md:hidden">{t("customers.add_customer", "Add Customer")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md group mx-auto lg:mx-0">
        <DebouncedSearchInput 
          placeholder={t("customers.search_customers", "Search by name, email or phone...")}
          onSearch={handleSearch}
          className="w-full"
        />
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          viewMode === 'table' ? <TableSkeleton rows={8} /> : <GridSkeleton items={8} />
        ) : customers.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No customers found" 
            description="Try a different search or add a new customer."
            actionLabel="Add Customer"
            onAction={() => openModal('customers', false, null)}
          />
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {customers.map(customer => (
                <div key={customer.id} onClick={() => window.location.href = `/customers/${customer.id}`} className="cursor-pointer">
                  <CustomerCard 
                    customer={customer} 
                    onEdit={() => handleEditModal(customer)}
                    onDelete={() => handleDeleteModal(customer)}
                    isOverdue={overdueCustomerIds.includes(customer.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto w-full max-md:hidden">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/customers/${customer.id}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs relative">
                              {customer.name.charAt(0)}
                              {overdueCustomerIds.includes(customer.id) && (
                                <>
                                  <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                  </span>
                                  <div className="absolute bottom-full mb-0.5 left-full -ml-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-xl rounded-bl-none border border-white/90 shadow-lg shadow-rose-500/40 flex items-center gap-1.5 z-20 whitespace-nowrap uppercase tracking-[0.08em] animate-pulse origin-bottom-left">
                                    <MessageSquare size={10} fill="currentColor" className="opacity-95" />
                                    <span>Promise Overdue</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <span className="text-sm font-bold text-slate-800 hover:text-primary-600 transition-colors">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-600">{customer.email}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{customer.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500 truncate max-w-[150px] block">
                            {customer.address || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {customer.isFrequent ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md">Frequent</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">Standard</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <TableActions 
                            onEdit={() => handleEditModal(customer)}
                            onDelete={() => handleDeleteModal(customer)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="hidden max-md:grid grid-cols-1 gap-4">
                {customers.map(customer => (
                <div key={customer.id} onClick={() => window.location.href = `/customers/${customer.id}`} className="cursor-pointer">
                  <CustomerCard 
                    customer={customer} 
                    onEdit={() => handleEditModal(customer)}
                    onDelete={() => handleDeleteModal(customer)}
                    isOverdue={overdueCustomerIds.includes(customer.id)}
                  />
                </div>
                ))}
              </div>
            </>
          )
        )}
      </div>

      {/* Cursor Pagination */}
      {(pagination.hasNextPage || pagination.hasPreviousPage) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{customers.length}</span> customers
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={!pagination.hasPreviousPage}
              onClick={pagination.onPreviousPage}
              className="px-4 py-2 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200/60 transition-all font-semibold text-xs"
            >
              Previous
            </button>
            <button 
              disabled={!pagination.hasNextPage}
              onClick={pagination.onNextPage}
              className="px-4 py-2 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200/60 transition-all font-semibold text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Toaster position="top-right" />

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => closeModal('customers')}
        title={selectedCustomer ? "Edit Customer" : "Add New Customer"}
        description={selectedCustomer ? "Update client details and preferences." : "Create a new profile for your catering client."}
        maxWidth="max-w-2xl"
      >
        <CreateCustomerForm 
          key={selectedCustomer ? selectedCustomer.id : 'new'}
          onSubmit={selectedCustomer ? handleUpdateCustomer : handleCreateCustomer}
          onCancel={() => closeModal('customers')}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={selectedCustomer}
        />
      </PremiumModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => closeModal('customers')}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedCustomer?.name}? This action cannot be undone.`}
        confirmText="Delete Record"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CustomersPage;
