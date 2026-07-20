import React from "react";
import { CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";

const DashboardStats = ({ totalEvents, confirmedEvents, pendingEvents }) => {
  return (
    <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 gap-3 mb-4 snap-x pb-2 sm:pb-0 scrollbar-none">
      <div className="min-w-[160px] sm:min-w-0 flex-1 shrink-0 snap-center bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest truncate">Total Engagements</p>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-850 tracking-tight truncate">{totalEvents} Planned</h3>
        </div>
        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0 ml-1">
          <CalendarDays className="w-4 h-4" />
        </div>
      </div>

      <div className="min-w-[160px] sm:min-w-0 flex-1 shrink-0 snap-center bg-emerald-50/30 p-3 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest truncate">Confirmed Events</p>
          <h3 className="text-sm sm:text-base font-extrabold text-emerald-800 tracking-tight truncate">{confirmedEvents} Active</h3>
        </div>
        <div className="p-2 bg-emerald-100/50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0 ml-1">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      <div className="min-w-[160px] sm:min-w-0 flex-1 shrink-0 snap-center bg-amber-50/30 p-3 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest truncate">Awaiting Confirmation</p>
          <h3 className="text-sm sm:text-base font-extrabold text-amber-800 tracking-tight truncate">{pendingEvents} Pending</h3>
        </div>
        <div className="p-2 bg-amber-100/50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0 ml-1">
          <AlertCircle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
