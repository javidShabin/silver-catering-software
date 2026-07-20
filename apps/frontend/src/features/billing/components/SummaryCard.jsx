import { CURRENCY } from "../../../config/currency";
import React from "react";
import { TrendingUp } from "lucide-react";

const SummaryCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-5 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-2 sm:p-2.5 rounded-xl ${color} bg-opacity-10 transition-transform group-hover:scale-105`}>
        <Icon size={16} className={`${color.replace('bg-', 'text-')} sm:w-[20px] sm:h-[20px]`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
          <TrendingUp size={10} /> {trend}
        </div>
      )}
    </div>
    <div className="mt-2.5 sm:mt-4 relative z-10">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5">{title}</p>
      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{CURRENCY}{value.toLocaleString()}</h3>
    </div>
    <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity group-hover:scale-110 duration-500`}>
      <Icon size={60} className={`${color.replace('bg-', 'text-')} sm:w-[80px] sm:h-[80px]`} />
    </div>
  </div>
);

export default SummaryCard;
