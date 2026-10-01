import React from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { CURRENCY } from "../../../config/currency";

const StaffAssignmentModal = ({
  isStaffModalOpen,
  setIsStaffModalOpen,
  allRoles,
  staffAllocations,
  updateStaffAllocation,
  removeStaffAllocation,
  addStaffAllocation,
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
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Staffing Allocations</h3>
            <p className="text-[11px] text-slate-400 font-medium">Allocate staff roles for this event.</p>
          </div>
          <button
            onClick={() => setIsStaffModalOpen(false)}
            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 min-h-[300px]">
          <div className="flex gap-2 items-center flex-wrap mb-4">
            <select
              className="flex-1 min-w-[150px] h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary-500 bg-slate-50"
              onChange={(e) => {
                if (e.target.value) {
                  const selectedRole = allRoles.find(r => r.id === e.target.value);
                  if (selectedRole) {
                    addStaffAllocation(selectedRole.name, Number(selectedRole.defaultRate), 1);
                  }
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select staff role to add...</option>
              {allRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} ({CURRENCY}{Number(role.defaultRate).toFixed(2)})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => addStaffAllocation("", 0, 1)}
              className="shrink-0 h-9 px-4 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors border bg-primary-50 text-primary-600 border-primary-100 hover:bg-primary-100"
            >
              <Plus size={14} /> Custom Role
            </button>
          </div>

          {staffAllocations.length > 0 ? (
            <div className="space-y-3">
              {staffAllocations.map((staff, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-xs">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Waiter"
                      value={staff.role}
                      onChange={(e) => updateStaffAllocation(idx, "role", e.target.value)}
                      className="w-full h-8 rounded border border-slate-200 px-2 outline-none focus:border-primary-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="space-y-1 w-20">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate</label>
                      <input 
                        type="number" min="0"
                        value={staff.rate !== undefined && staff.rate !== null ? staff.rate : ""}
                        onChange={(e) => updateStaffAllocation(idx, "rate", e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full h-8 rounded border border-slate-200 px-2 outline-none focus:border-primary-500 font-medium"
                      />
                    </div>
                    <div className="space-y-1 w-16">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Count</label>
                      <input 
                        type="number" min="0"
                        value={staff.count !== undefined && staff.count !== null ? staff.count : ""}
                        onChange={(e) => updateStaffAllocation(idx, "count", e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full h-8 rounded border border-slate-200 px-2 outline-none focus:border-primary-500 font-bold"
                      />
                    </div>
                    <div className="space-y-1 text-right w-24">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total/Day</label>
                      <div className="h-8 flex items-center justify-end font-bold text-slate-800">
                        {CURRENCY}{(Number(staff.count || 0) * Number(staff.rate || 0)).toFixed(2)}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeStaffAllocation(idx)} 
                      className="mt-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <p>No staff roles allocated yet.</p>
              <p className="text-[10px] mt-1">Select a role from the dropdown to add.</p>
            </div>
          )}
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
              "Save Staff Allocations"
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
