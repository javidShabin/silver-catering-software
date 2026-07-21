import { CURRENCY } from "../../config/currency";
import React, { useRef, useState } from "react";
import PremiumModal from "../../components/ui/PremiumModal";
import { Toaster } from "react-hot-toast";
import ConfirmModal from "../../components/ui/ConfirmModal";
import TableActions from "../../components/ui/table/TableActions";
import { 
  Utensils, 
  Plus, 
  LayoutGrid,
  List,
  Sparkles,
  Settings
} from "lucide-react";
import CreateMenuForm from "./components/CreateMenuForm";
import ManageCategoriesModal from "./components/ManageCategoriesModal";
import DebouncedSearchInput from "../../components/ui/DebouncedSearchInput";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton, GridSkeleton } from "../../components/ui/Skeleton";
import MenuCard from "./components/MenuCard";
import { useMenuManagement } from "./hooks/useMenuManagement";
import { useTranslation } from "react-i18next";

const MenuPage = () => {
  const { t } = useTranslation();
  const {
    viewMode, setViewMode,
    items, isLoading, categories, dbCategories,
    category, setFilter,
    isModalOpen, isDeleteModalOpen, selectedItem, isCategoryModalOpen,
    closeModal, openModal,
    handleSearch, handleEditModal, handleDeleteModal, handleCategoryModal,
    handleCreateItem, handleUpdateItem,
    updateMutation, createMutation, deleteMutation,
    pagination
  } = useMenuManagement();

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
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-1">

          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{t("menu.culinary_directory", "Culinary Directory")}</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-md mx-auto lg:mx-0">{t("menu.menu_subtitle", "Plan and manage your event menus, plate pricing, and dietary options with ease.")}</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">
          <div className="hidden sm:flex bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
          </div>
          <button 
            onClick={handleCategoryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Settings size={14} className="text-slate-400" /> <span className="hidden sm:inline">{t("menu.categories", "Categories")}</span>
          </button>
          <button 
            onClick={() => openModal('menu', false, null)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50"
          >
            <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("menu.add_menu_item", "Add Menu Item")}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md group mx-auto md:mx-0">
          <DebouncedSearchInput 
            placeholder={t("menu.search_dish", "Search by dish name...")}
            onSearch={handleSearch}
            className="w-full"
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
                onClick={() => !hasDragged && setFilter('menu', { category: cat, cursor: null, cursorsStack: [] })}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                  category === cat 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/20' 
                  : 'bg-white text-slate-500 border-slate-200/60 hover:border-primary-200 hover:bg-primary-50/30'
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
          viewMode === 'table' ? <TableSkeleton rows={8} cols={5} /> : <GridSkeleton items={8} />
        ) : items.length === 0 ? (
          <EmptyState 
            icon={Utensils} 
            title="Your Menu is Empty" 
            description="Start creating your culinary masterpieces for upcoming events."
            actionLabel="Add Menu Item"
            onAction={() => openModal('menu', false, null)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map(item => (
              <MenuCard 
                key={item.id} 
                item={item} 
                onEdit={handleEditModal}
                onDelete={handleDeleteModal}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto w-full max-md:hidden">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dish Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shrink-0">
                            {item.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-slate-800 block truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{item.description || "No description"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md whitespace-nowrap">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md whitespace-nowrap ${item.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <TableActions 
                          onEdit={() => openModal('menu', false, item)}
                          onDelete={() => openModal('menu', true, item)}
                          onView={() => {}}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hidden max-md:grid grid-cols-1 gap-4">
              {items.map(item => (
                <MenuCard 
                  key={item.id} 
                  item={item} 
                  onEdit={handleEditModal}
                  onDelete={handleDeleteModal}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cursor Pagination */}
      {(pagination.hasNextPage || pagination.hasPreviousPage) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{items.length}</span> menu items
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
        onClose={() => closeModal('menu')}
        title={selectedItem ? "Edit Recipe" : "Add New Dish"}
        description={selectedItem ? "Refine your culinary creation details." : "Register a new dish into your digital menu."}
        maxWidth="max-w-2xl"
        compactHeader={true}
      >
        <CreateMenuForm 
          onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}
          onCancel={() => closeModal('menu')}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={selectedItem}
          categories={dbCategories}
        />
      </PremiumModal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => closeModal('menu')}
        onConfirm={() => deleteMutation.mutate(selectedItem?.id)}
        title="Remove Menu Item"
        message={`Are you sure you want to delete ${selectedItem?.name}? This dish will be permanently removed from your catalog.`}
        type="danger"
        isLoading={deleteMutation.isPending}
      />

      <PremiumModal
        isOpen={isCategoryModalOpen}
        onClose={() => closeModal('menu')}
        title="Manage Categories"
        description="Organize your menu into distinct sections to help customers browse easier."
        maxWidth="max-w-3xl"
      >
        <ManageCategoriesModal onClose={() => closeModal('menu')} />
      </PremiumModal>
    </div>
  );
};

export default MenuPage;
