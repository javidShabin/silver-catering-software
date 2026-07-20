import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, RefreshCw, Loader2 } from 'lucide-react';
import { playActionSound } from '../../../utils/sound';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100' },
  { value: 'completed', label: 'Completed', color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100' },
];

const CustomEventPopup = ({ isOpen, onClose, onConfirm, type = 'delete', title, message, event, isLoading }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      playActionSound('popup');
      if (type === 'status' && event) {
        setSelectedStatus(event.status?.toLowerCase() || 'pending');
      }
    }
  }, [isOpen, type, event]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'status') {
      onConfirm(selectedStatus);
    } else {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 p-6 flex flex-col items-center text-center"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>

          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${
            type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-[#ff6b00]/10 text-[#ff6b00]'
          }`}>
            {type === 'delete' ? <Trash2 size={24} /> : <RefreshCw size={24} />}
          </div>

          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
            {title || (type === 'delete' ? 'Remove Event' : 'Update Status')}
          </h3>
          
          <p className="text-sm text-slate-500 mb-5 max-w-[280px]">
            {message || (type === 'delete' ? `Are you sure you want to permanently remove "${event?.title}"?` : 'Select the new status for this event.')}
          </p>

          {type === 'status' && (
            <div className="w-full grid grid-cols-2 gap-2.5 mb-6">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSelectedStatus(opt.value);
                    playActionSound('popup');
                  }}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                    selectedStatus === opt.value 
                      ? 'ring-2 ring-[#ff6b00] ring-offset-2 ' + opt.color 
                      : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                  } uppercase tracking-widest`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="w-full flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (type === 'status' && !selectedStatus)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                type === 'delete' 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
                  : 'bg-[#ff6b00] hover:bg-[#e66000] shadow-[#ff6b00]/25'
              } disabled:opacity-50`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (type === 'delete' ? 'Remove' : 'Update')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomEventPopup;
