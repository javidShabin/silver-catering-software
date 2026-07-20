import React from "react";
import { CalendarDays, Users, Receipt, User } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-md transition-all duration-300 group">
    <div className={`p-2.5 rounded-lg ${colorClass} group-hover:scale-105 transition-transform duration-305 shadow-sm`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
      <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

const QuickStats = ({ tenant }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard 
        title="Total Events" 
        value={tenant._count?.events || 0} 
        icon={CalendarDays} 
        colorClass="bg-blue-50 text-blue-600" 
      />
      <StatCard 
        title="Customers" 
        value={tenant._count?.customers || 0} 
        icon={Users} 
        colorClass="bg-purple-50 text-purple-600" 
      />
      <StatCard 
        title="Invoices" 
        value={tenant._count?.invoices || 0} 
        icon={Receipt} 
        colorClass="bg-amber-50 text-amber-600" 
      />
      <StatCard 
        title="Team Directory" 
        value={tenant.users?.length || 0} 
        icon={User} 
        colorClass="bg-emerald-50 text-emerald-600" 
      />
    </div>
  );
};

export default QuickStats;
