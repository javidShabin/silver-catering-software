import React from "react";
import { motion } from "framer-motion";
import { X, Search, ShieldAlert, Mail, Check } from "lucide-react";
import { getCateringDesignation } from "../utils/cateringUtils";

const StaffAssignmentModal = ({
  isStaffModalOpen,
  setIsStaffModalOpen,
  staffModalTab,
  setStaffModalTab,
  selectedStaff,
  staffSearchQuery,
  setStaffSearchQuery,
  filteredStaff,
  handleToggleStaff,
  handleSaveStaffAssignments,
  isSavingStaff
}) => {
  if (!isStaffModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsStaffModalOpen(false)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-[28px] border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in"
      >
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Assign Catering Team</h3>
            <p className="text-[11px] text-slate-400 font-medium">Designate qualified Cook/Chef, Event Captain, or Catering Boys to this event.</p>
          </div>
          <button
            onClick={() => setIsStaffModalOpen(false)}
            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 min-h-[300px]">
            <div className="flex items-center gap-2 p-1 bg-slate-100/70 rounded-lg w-full sm:w-auto flex-nowrap overflow-x-auto scrollbar-none">
              <button 
                onClick={() => setStaffModalTab("add")}
                className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${staffModalTab === 'add' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Add Staff
              </button>
              <button 
                onClick={() => setStaffModalTab("selected")}
                className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${staffModalTab === 'selected' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Selected Staff
                <span className="bg-slate-200 text-slate-600 px-1.5 rounded-sm">{selectedStaff.length}</span>
              </button>
            </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search crew by name, department (Culinary, Service, Logistics)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all"
              value={staffSearchQuery}
              onChange={(e) => setStaffSearchQuery(e.target.value)}
            />
          </div>

          <div className="border border-slate-100 rounded-2xl bg-slate-50/20 max-h-[350px] overflow-y-auto p-2.5 space-y-2">
            {(() => {
              const listToRender = staffModalTab === "add" ? filteredStaff : selectedStaff.filter((member) =>
                member.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                (member.department || "").toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                getCateringDesignation(member).toLowerCase().includes(staffSearchQuery.toLowerCase())
              );

              return listToRender.length > 0 ? (
                listToRender.map((member) => {
                const isAssigned = selectedStaff.some((s) => (s.id) === (member.id));
                const designation = getCateringDesignation(member);
                
                let badgeStyle = "bg-slate-100 text-slate-655 border-slate-200";
                if (designation.includes("Cook") || designation.includes("Chef")) {
                  badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100/60";
                } else if (designation.includes("Captain")) {
                  badgeStyle = "bg-violet-50 text-violet-700 border-violet-100/60";
                } else if (designation.includes("Boy") || designation.includes("Catering")) {
                  badgeStyle = "bg-sky-50 text-sky-700 border-sky-100/60";
                }

                return (
                  <div
                    key={member.id}
                    onClick={() => handleToggleStaff(member)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isAssigned
                        ? "bg-white border-primary-500 shadow-sm"
                        : "bg-white/40 border-slate-150 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">{member.name}</p>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${badgeStyle}`}>
                            {designation}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="flex items-center gap-1 truncate"><Mail size={10} /> {member.email}</span>
                          {member.phone && <span className="shrink-0">• Phone: {member.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isAssigned 
                          ? "bg-primary-500 border-primary-500 text-white" 
                          : "border-slate-200"
                      }`}>
                        {isAssigned && <Check size={10} strokeWidth={4} />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <ShieldAlert size={18} className="mx-auto text-slate-300" />
                <p>No operational crew members matched your search query.</p>
                <p className="text-[10px] text-slate-400/80">Ensure staff are onboarded under culinary, service or logistics roles.</p>
              </div>
            );
            })()}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={() => setIsStaffModalOpen(false)}
            className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveStaffAssignments}
            disabled={isSavingStaff}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            {isSavingStaff ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Catering Team"
            )}
          </button>
        </div>

        <div className="absolute -top-20 -right-20 w-44 h-44 bg-primary-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default React.memo(StaffAssignmentModal);
