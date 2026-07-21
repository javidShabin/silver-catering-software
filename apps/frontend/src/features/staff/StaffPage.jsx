import React, { useCallback } from "react";
import { Users, ChevronLeft, ChevronRight, Search, Plus, Sparkles } from "lucide-react";
import PremiumModal from "../../components/ui/PremiumModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useStaffManagement } from "./hooks/useStaffManagement";
import { useRolesManagement } from "./hooks/useRolesManagement";
import { StaffCard } from "./components/StaffCard";
import { StaffHeader } from "./components/StaffHeader";
import { RolesManagerModal } from "./components/RolesManagerModal";
import CreateStaffForm from "./components/CreateStaffForm";
import EmptyState from "../../components/ui/EmptyState";
import { GridSkeleton } from "../../components/ui/Skeleton";
import { useTranslation } from "react-i18next";

const StaffPage = () => {
  const { t } = useTranslation();
  const {
    staff, isLoading,
    search, setSearch,
    roleFilter, setRoleFilter,
    isModalOpen, setIsModalOpen,
    isDeleteModalOpen, setIsDeleteModalOpen,
    selectedStaff, setSelectedStaff,
    pagination, setPagination,
    handleAddStaff, handleUpdateStaff, handleDeleteStaff
  } = useStaffManagement();

  const {
    isRolesModalOpen, setIsRolesModalOpen,
    roles,
    isAddingRole, setIsAddingRole,
    editingRole, setEditingRole,
    roleForm, setRoleForm,
    isLoadingRoles,
    handleSaveRole,
    handleDeleteRole
  } = useRolesManagement();

  const openEditModal = useCallback((member) => {
    setSelectedStaff(member);
    setIsModalOpen(true);
  }, [setSelectedStaff, setIsModalOpen]);

  const openDeleteModal = useCallback((member) => {
    setSelectedStaff(member);
    setIsDeleteModalOpen(true);
  }, [setSelectedStaff, setIsDeleteModalOpen]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">

          <h1 className="text-xl font-black text-slate-900 tracking-tight">{t("staff.staff_directory", "Staff Directory")}</h1>
          <p className="text-xs text-slate-500">{t("staff.staff_subtitle", "Manage your catering team, roles, and access.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder={t("staff.search_staff", "Search staff...")}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsRolesModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl transition-all shadow-sm shrink-0"
          >
            Manage Roles
          </button>
          <button 
            onClick={() => { setSelectedStaff(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50 max-md:bg-primary-600 max-md:hover:bg-primary-500 max-md:shadow-primary-500/25"
          >
            <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("staff.add_staff", "Add Staff")}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <GridSkeleton items={8} />
      ) : staff.length === 0 ? (
        <EmptyState 
          icon={Users} 
          title="No staff members found" 
          description="Try adjusting your filters or add a new team member."
          actionLabel="Onboard Staff"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {staff.map(member => (
            <StaffCard 
              key={member.id} 
              member={member} 
              onEdit={() => openEditModal(member)} 
              onDelete={() => openDeleteModal(member)} 
            />
          ))}
        </div>
      )}

      {/* Cursor Pagination */}
      {(pagination.hasNextPage || pagination.hasPreviousPage) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{staff.length}</span> staff members
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
        onClose={() => setIsModalOpen(false)}
        title={selectedStaff ? "Edit Staff Member" : "Onboard Staff Member"}
        description={selectedStaff ? "Update organizational roles and system permissions." : "Grant system access and assign organizational roles to your culinary and operations team."}
        maxWidth="max-w-3xl"
      >
        <CreateStaffForm 
          key={selectedStaff ? selectedStaff.id : 'new'}
          onSubmit={selectedStaff ? handleUpdateStaff : handleAddStaff}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isLoading}
          initialData={selectedStaff}
        />
      </PremiumModal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${selectedStaff?.name}? This action will revoke their system access completely.`}
        type="danger"
      />

      <RolesManagerModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
        roles={roles}
        isAddingRole={isAddingRole}
        setIsAddingRole={setIsAddingRole}
        editingRole={editingRole}
        setEditingRole={setEditingRole}
        roleForm={roleForm}
        setRoleForm={setRoleForm}
        isLoadingRoles={isLoadingRoles}
        handleSaveRole={handleSaveRole}
        handleDeleteRole={handleDeleteRole}
      />
    </div>
  );
};

export default StaffPage;
