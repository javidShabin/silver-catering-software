import { CURRENCY } from "../../../config/currency";
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import DatePicker from "../../../components/ui/DatePicker";

const EditEventModal = ({ 
  isEditModalOpen, 
  setIsEditModalOpen, 
  editFormData, 
  setEditFormData, 
  handleSaveEventDetails, 
  isSaving 
}) => {
  if (!isEditModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsEditModalOpen(false)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-3xl bg-white rounded-[28px] border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in animate-duration-300"
      >
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Edit Event Details</h3>
            <p className="text-[11px] text-slate-400 font-medium">Update the core logistics, schedule, and metadata for this event.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSaveEventDetails} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Corporate Summer Gala"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Event Status</label>
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-slate-700 font-semibold appearance-none"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Guest Count</label>
              <input
                type="number"
                required
                min="1"
                placeholder="100"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
                value={editFormData.guestCount}
                onChange={(e) => setEditFormData({ ...editFormData, guestCount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <DatePicker
                label="Date"
                required
                inputClassName="bg-slate-50 border-slate-100 rounded-xl px-4 py-2.5 text-xs h-[38px]"
                value={editFormData.date}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Time</label>
              <input
                type="time"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-slate-700 font-semibold"
                value={editFormData.time}
                onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Duration (Days)</label>
              <input
                type="number"
                required
                min="1"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
                value={editFormData.durationInDays}
                onChange={(e) => setEditFormData({ ...editFormData, durationInDays: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Venue Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Ballroom, Plaza Hotel"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
              value={editFormData.location}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Event Fee (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-7 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
                  value={editFormData.eventFee}
                  onChange={(e) => setEditFormData({ ...editFormData, eventFee: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Advance Amount (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-7 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
                  value={editFormData.advanceAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, advanceAmount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Tax Rate (%)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-7 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
                  value={editFormData.taxRate}
                  onChange={(e) => setEditFormData({ ...editFormData, taxRate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Discount Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-7 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 font-semibold"
                  value={editFormData.discountValue}
                  onChange={(e) => setEditFormData({ ...editFormData, discountValue: e.target.value })}
                />
              </div>
            </div>
          </div>



          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-6 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        <div className="absolute -top-20 -right-20 w-44 h-44 bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default React.memo(EditEventModal);
