import React from "react";

const StatCard = ({ title, value, icon: Icon, type = "blue", trend }) => {
  
  const styleMap = {
    blue: "bg-blue-50 text-blue-500 border-blue-100/50",
    orange: "bg-orange-50 text-orange-500 border-orange-100/50",
    lavender: "bg-primary-50 text-primary-500 border-primary-100/50",
    cyan: "bg-cyan-50 text-cyan-500 border-cyan-100/50",
    rose: "bg-rose-50 text-rose-500 border-rose-100/50",
    emerald: "bg-emerald-50 text-emerald-500 border-emerald-100/50"
  };
  
  const iconStyle = styleMap[type] || styleMap.blue;

  return (
    <div className="card-premium p-5 flex flex-col justify-between h-full bg-white transition-all hover:shadow-xl hover:shadow-slate-200/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 mb-1.5 tracking-[0.15em] uppercase leading-tight">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${iconStyle}`}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-5 flex items-center gap-2">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
            trend.isPositive ? "bg-success-50 text-success-500" : "bg-alert-50 text-alert-500"
          }`}>
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            {trend.value}%
          </div>
          <span className="text-[10px] font-medium text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
