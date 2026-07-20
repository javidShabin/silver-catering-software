import React from "react";
import { motion } from "framer-motion";
import { X, Calendar as CalendarIcon, Clock, MapPin, Users, CookingPot } from "lucide-react";

const EventDetailsPanel = ({ selectedEvent, setSelectedEvent, setPrefilledDate, setIsCreateModalOpen, navigate }) => {
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-b from-white to-slate-50/50 p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between flex-1 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 rounded-full bg-primary-500/5 blur-xl pointer-events-none" />
      
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest border ${
            selectedEvent.status === "confirmed" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : selectedEvent.status === "pending" 
                ? "bg-amber-50 text-amber-700 border-amber-100" 
                : "bg-blue-50 text-blue-700 border-blue-100"
          }`}>
            {selectedEvent.status}
          </span>
          <button 
            onClick={() => setSelectedEvent(null)}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <h2 className="text-sm font-black text-slate-900 tracking-tight leading-snug mb-3.5">
          {selectedEvent.title}
        </h2>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
              <CalendarIcon size={13} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-[11px] font-bold text-slate-800">
                {new Date(selectedEvent.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
              <Clock size={13} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time Schedule</p>
              <p className="text-[11px] font-bold text-slate-800">{selectedEvent.time || "Not specified"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
              <MapPin size={13} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Venue / Location</p>
              <p className="text-[11px] font-bold text-slate-800 truncate max-w-[150px]">{selectedEvent.location || "On-site"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
              <Users size={13} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estimated Attendance</p>
              <p className="text-[11px] font-bold text-slate-800">{selectedEvent.guestCount || "TBD"} guests</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
              <CookingPot size={13} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Package Type</p>
              <p className="text-[11px] font-extrabold text-primary-600 capitalize">{selectedEvent.type || "Standard"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mt-4">
        <button 
          onClick={() => {
            setPrefilledDate(selectedEvent.date?.split("T")[0]);
            setIsCreateModalOpen(true);
          }}
          className="w-full py-2 text-[10px] font-bold text-slate-650 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-all hover:bg-slate-50 cursor-pointer"
        >
          Modify Logistics
        </button>
        <button 
          onClick={() => navigate(`/events/${selectedEvent.id}`)}
          className="w-full py-2 text-[10px] font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default EventDetailsPanel;
