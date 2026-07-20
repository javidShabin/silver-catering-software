import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, CalendarDays } from "lucide-react";

const UpcomingAgenda = ({ upcomingEvents, setSelectedEvent }) => {
  return (
    <motion.div
      key="agenda"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col flex-1 overflow-hidden"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp size={14} className="text-primary-500" />
        <h2 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Upcoming Schedule</h2>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-none space-y-2 pr-1 scrollbar-hide">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => (
            <div 
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="p-2.5 bg-slate-50/75 hover:bg-primary-50/5 rounded-xl border border-slate-100/60 hover:border-primary-100/30 cursor-pointer transition-all flex items-start justify-between group"
            >
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-extrabold text-slate-850 group-hover:text-primary-700 transition-colors leading-tight line-clamp-1">
                  {event.title}
                </h4>
                <p className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                  <Clock size={9} /> {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {event.time}
                </p>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[7px] font-extrabold border uppercase tracking-wider ${
                event.status === "confirmed" 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}>
                {event.status}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-6">
            <CalendarDays size={24} className="opacity-30 mb-1.5 animate-bounce" />
            <p className="text-[11px] font-bold">No upcoming engagements</p>
            <p className="text-[9px] opacity-75 mt-0.5">Click "Plan Event" to schedule.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingAgenda;
