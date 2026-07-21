import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCircle,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Shield
} from "lucide-react";

export const StaffCard = React.memo(({ member, onEdit, onDelete, isCurrentUser }) => {
  const roleColors = {
    admin: "bg-rose-50 text-rose-600 border-rose-100",
    manager: "bg-amber-50 text-amber-600 border-amber-100",
    "kitchen-staff": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "delivery-staff": "bg-blue-50 text-blue-600 border-blue-100",
    accountant: "bg-primary-50 text-primary-600 border-primary-100",
    user: "bg-slate-50 text-slate-500 border-slate-100"
  };

  const statusIcons = {
    active: <CheckCircle2 size={12} className="text-emerald-500" />,
    inactive: <XCircle size={12} className="text-slate-400" />,
    suspended: <AlertTriangle size={12} className="text-rose-500" />
  };

  const roleClass = roleColors[member.role] || "bg-purple-50 text-purple-600 border-purple-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-100 p-1.5 sm:p-2 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-1 relative z-10">
        <div className="p-1 rounded-md bg-slate-50 flex items-center justify-center text-slate-350 group-hover:text-primary-500 group-hover:bg-primary-50 transition-colors shrink-0">
          <UserCircle size={16} strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">
          {statusIcons[member.status] || statusIcons.inactive}
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{member.status}</span>
        </div>
      </div>

      <div className="space-y-1 flex-1 flex flex-col justify-between relative z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate leading-tight">{member.name}</h3>
          <p className="text-[9px] text-slate-400 font-medium truncate">{member.email}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border uppercase tracking-wider ${roleClass}`}>
            {member.role.replace(/-/g, ' ')}
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wider truncate max-w-[100px]">
            {member.department}
          </span>
        </div>

        <div className="pt-1.5 mt-1 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              <Mail size={12} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
              <Phone size={12} />
            </button>
          </div>
          <div className="flex items-center gap-0.5">
            {!isCurrentUser && (
              <>
                <button onClick={() => onEdit(member)} className="p-1.5 text-slate-350 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(member)} className="p-1.5 text-slate-355 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-3 opacity-[0.015] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none">
        <Shield size={80} className="text-slate-900" />
      </div>
    </motion.div>
  );
});
