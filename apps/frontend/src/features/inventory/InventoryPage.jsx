import React, { useState, useRef } from "react";
import PremiumModal from "../../components/ui/PremiumModal";
import { Toaster } from "react-hot-toast";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { 
  Package, 
  Plus, 
  LayoutGrid,
  List,
  Search
} from "lucide-react";
import CreateInventoryForm from "./components/CreateInventoryForm";
import DebouncedSearchInput from "../../components/ui/DebouncedSearchInput";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton, GridSkeleton } from "../../components/ui/Skeleton";
import InventoryCard from "./components/InventoryCard";
import ManageInventoryCategoriesModal from "./components/ManageInventoryCategoriesModal";
import { useInventoryManagement } from "./hooks/useInventoryManagement";
import { useTranslation } from "react-i18next";

const statusColors = {
  "In Stock": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Low Stock": "bg-amber-50 text-amber-600 border-amber-100",
  "Out of Stock": "bg-rose-50 text-rose-600 border-rose-100"
};

const InventoryPage = () => {
  const { t } = useTranslation();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const {
    viewMode, setViewMode,
    items, isLoading, categories,
    category, setFilter, search, setSearch,
    isModalOpen, isDeleteModalOpen, selectedItem,
    closeModal, openModal,
    handleSearch, handleEditModal, handleDeleteModal,
    handleUpdateStock, handleCreateItem, handleUpdateItem, handleDeleteItem,
    updateMutation, createMutation, deleteMutation,
    pagination, setSelectedItem, setIsModalOpen
  } = useInventoryManagement();

  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 10) setHasDragged(true);
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{t("inventory.inventory_management", "Inventory Management")}</h1>
          <p className="text-xs text-slate-500 font-medium">{t("inventory.inventory_subtitle", "Track and manage your kitchen supplies and equipment.")}</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <div className="hidden sm:flex bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('table')} 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={16} />
            </button>
          </div>
          <div className="w-full flex justify-center sm:w-auto gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl transition-all shadow-sm shrink-0"
            >
              Manage Categories
            </button>
            <button 
              onClick={() => openModal('inventory', false, null)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50 max-md:bg-primary-600 max-md:hover:bg-primary-500 max-md:shadow-primary-500/25"
            >
              <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("inventory.add_item", "Add Item")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder={t("inventory.search_inventory", "Search inventory...")}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>

        <div className="relative w-full md:flex-1 min-w-0 max-w-full overflow-hidden">
          <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full scrollbar-none flex-nowrap pr-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => !hasDragged && setFilter('inventory', { category: cat, cursor: null, cursorsStack: [] })}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  category === cat 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                  : 'bg-white text-slate-500 border border-slate-200/60 hover:border-primary-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-2 md:bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none flex items-center justify-end pr-1">
            <div className="w-4 h-[3px] rounded-full bg-orange-500/60 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          viewMode === 'table' ? <TableSkeleton rows={8} /> : <GridSkeleton items={8} />
        ) : items.length === 0 ? (
          <EmptyState 
            icon={Package} 
            title="No items found" 
            description="Start by adding your first item to the inventory system."
            actionLabel="Add Item"
            onAction={() => openModal('inventory', false, null)}
          />
        ) : (
          viewMode === 'table' ? (
            <>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hidden max-md:hidden overflow-x-auto w-full md:block">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">{t("common.item_name", "Item Name")}</th>
                      <th className="px-6 py-4">{t("common.category", "Category")}</th>
                      <th className="px-6 py-4 text-center">{t("common.status", "Status")}</th>
                      <th className="px-6 py-4 text-right">{t("common.current_stock", "Current Stock")}</th>
                      <th className="px-6 py-4 text-right">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                        <td className="px-6 py-4 text-slate-400">{item.category}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {item.quantity} <span className="text-[10px] font-medium text-slate-500">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => openModal('inventory', false, item)}
                              className="px-2.5 py-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors font-bold text-[10px]"
                            >
                              {t("common.edit", "Edit")}
                            </button>
                            <button
                              onClick={() => openModal('inventory', true, item)}
                              className="px-2.5 py-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors font-bold text-[10px]"
                            >
                              {t("common.delete", "Delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card List Fallback */}
              <div className="grid grid-cols-1 gap-4 hidden max-md:grid">
                {items.map(item => (
                  <InventoryCard 
                    key={item.id} 
                    item={item} 
                    onUpdateStock={handleUpdateStock}
                    onEdit={handleEditModal}
                    onDelete={handleDeleteModal}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => (
                <InventoryCard 
                  key={item.id} 
                  item={item} 
                  onUpdateStock={handleUpdateStock}
                  onEdit={handleEditModal}
                  onDelete={handleDeleteModal}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Cursor Pagination */}
      {(pagination.hasNextPage || pagination.hasPreviousPage) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{items.length}</span> inventory items
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

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => closeModal('inventory')}
        title={selectedItem ? "Edit Record" : "Add Inventory"}
        description={selectedItem ? "Update your stock item details." : "Register a new item into your inventory system."}
        maxWidth="max-w-3xl"
      >
        <CreateInventoryForm 
          onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}
          onCancel={() => closeModal('inventory')}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={selectedItem}
        />
      </PremiumModal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => closeModal('inventory')}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message={`Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`}
        type="danger"
        isLoading={deleteMutation.isPending}
      />
      
      <ManageInventoryCategoriesModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      
      <Toaster position="top-right" />
    </div>
  );
};

export default InventoryPage;
