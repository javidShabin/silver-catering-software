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
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in animate-duration-300"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900">Edit Event Details</h3>
            <p className="text-xs text-slate-500">Update the core logistics, schedule, and metadata for this event.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveEventDetails} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Corporate Summer Gala"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Event Status</label>
              <select
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Guest Count</label>
              <input
                type="number"
                required
                min="1"
                placeholder="100"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={editFormData.guestCount}
                onChange={(e) => setEditFormData({ ...editFormData, guestCount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <input
                type="date"
                required
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={editFormData.date ? editFormData.date.split('T')[0] : ''}
                onChange={(e) => setEditFormData({ ...editFormData, date: new Date(e.target.value).toISOString() })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Time</label>
              <input
                type="time"
                required
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={editFormData.time}
                onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Duration (Days)</label>
              <input
                type="number"
                required
                min="1"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={editFormData.durationInDays}
                onChange={(e) => setEditFormData({ ...editFormData, durationInDays: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Venue Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Ballroom, Plaza Hotel"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              value={editFormData.location}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Event Fee (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  className="w-full h-9 rounded-lg border border-slate-200 pl-7 pr-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                  value={editFormData.eventFee}
                  onChange={(e) => setEditFormData({ ...editFormData, eventFee: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Advance Amount (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  className="w-full h-9 rounded-lg border border-slate-200 pl-7 pr-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                  value={editFormData.advanceAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, advanceAmount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1" title="Tax rate can only be edited in Settings">
              <label className="text-xs font-semibold text-slate-700">Tax Rate (%)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                <input
                  type="number"
                  disabled={true}
                  placeholder="e.g. 5"
                  className="w-full h-9 rounded-lg border border-slate-200 pl-7 pr-3 text-xs text-slate-400 bg-slate-50 cursor-not-allowed outline-none"
                  value={editFormData.taxRate}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Discount Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  className="w-full h-9 rounded-lg border border-slate-200 pl-7 pr-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                  value={editFormData.discountValue}
                  onChange={(e) => setEditFormData({ ...editFormData, discountValue: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
