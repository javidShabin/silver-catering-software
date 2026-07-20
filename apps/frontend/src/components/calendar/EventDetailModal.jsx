import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendar } from './CalendarContext';
import { 
  X, 
  MapPin, 
  Clock, 
  Users, 
  Calendar as CalendarIcon, 
  Catering, 
  Edit, 
  Trash2,
  ChevronRight,
  ExternalLink,
  ChefHat
} from 'lucide-react';

const EventDetailModal = () => {
  const { selectedEvent, setSelectedEvent } = useCalendar();

  if (!selectedEvent) return null;

  return (
    <AnimatePresence>
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            layoutId={`event-${selectedEvent.id}`}
            className={`
              relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-[32px] overflow-hidden shadow-2xl border border-white/10
              flex flex-col
            `}
          >
            {/* Header / Banner */}
            <div className={`h-32 relative ${selectedEvent.color} flex items-end p-8`}>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md"
              >
                <X size={20} className="text-white" />
              </button>
              
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">Catering Event</span>
                <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-blue-500">
                      <CalendarIcon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(selectedEvent.start))}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(selectedEvent.start))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-purple-500">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate w-32">
                        {selectedEvent.location}
                      </p>
                      <button className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-1">
                        Open Maps <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Staff</p>
                  <button className="text-[10px] text-blue-500 font-bold hover:underline">Manage Staff</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedEvent.staff.map((staff, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-500">
                        {staff.avatar}
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{staff.name}</span>
                    </div>
                  ))}
                  <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedEvent.color}`}>
                    {selectedEvent.status}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    ID: #{selectedEvent.id}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                    <Edit size={14} />
                    Edit Event
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EventDetailModal;
