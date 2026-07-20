import React from "react";
import { Shield, UserPlus } from "lucide-react";
import DebouncedSearchInput from "../../../components/ui/DebouncedSearchInput";

export const StaffHeader = ({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  roles,
  setPagination,
  setIsRolesModalOpen,
  setIsModalOpen,
  setSelectedStaff
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Shield size={12} /> Workforce Management
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Staff & Access Control</h1>
          <p className="text-xs text-slate-500">Manage organizational roles, departments, and system permissions.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsRolesModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Shield size={14} /> Manage Roles
          </button>
          <button 
            onClick={() => { setSelectedStaff(null); setIsModalOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0"
          >
            <UserPlus size={14} /> Onboard Staff
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-2">
        <div className="relative w-full sm:max-w-sm group">
          <DebouncedSearchInput 
            placeholder="Search by name or email..."
            onSearch={(value) => { setSearch(value); setPagination(1); }}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => { setRoleFilter("all"); setPagination(1); }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border shrink-0 ${
              roleFilter === "all" 
              ? 'bg-white text-slate-900 border-slate-900 shadow-sm' 
              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'
            }`}
          >
            ALL
          </button>
          {roles.map((roleObj) => (
            <button
              key={roleObj.name}
              onClick={() => { setRoleFilter(roleObj.name); setPagination(1); }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                roleFilter === roleObj.name 
                ? 'bg-white text-slate-900 border-slate-900 shadow-sm' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'
              }`}
            >
              {roleObj.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
