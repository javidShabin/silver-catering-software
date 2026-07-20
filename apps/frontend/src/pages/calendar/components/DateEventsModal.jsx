import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, MapPin, Users, X } from "lucide-react";

const DateEventsModal = React.memo(({ date, events, onEventClick, onClose }) => {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const d = new Date(date + "T12:00:00");

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {dayNames[d.getDay()]}, {monthNames[d.getMonth()]} {d.getDate()}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{events.length} {events.length === 1 ? 'event' : 'events'} scheduled</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CalendarIcon size={32} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No events scheduled for this day.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => { onEventClick(event); onClose(); }}
                  className="w-full text-left px-6 py-4 transition-colors hover:bg-white flex items-start gap-4 group cursor-pointer"
                >
                  <div className={`w-1 h-full min-h-[40px] rounded-full flex-shrink-0 mt-0.5 ${
                    event.status === "confirmed" ? "bg-emerald-400" :
                    event.status === "pending" ? "bg-amber-400" :
                    "bg-blue-400"
                  }`} />
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[14px] font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{event.title}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide flex-shrink-0 ${
                        event.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : 
                        event.status === "pending" ? "bg-amber-50 text-amber-700" : 
                        "bg-blue-50 text-blue-700"
                      }`}>{event.status}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500">
                      {event.time && (
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {event.time}</span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1.5 truncate max-w-[180px]"><MapPin size={12} className="text-slate-400" /> {event.location}</span>
                      )}
                      {event.guestCount && (
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-slate-400" /> {event.guestCount} guests</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});

export default DateEventsModal;
