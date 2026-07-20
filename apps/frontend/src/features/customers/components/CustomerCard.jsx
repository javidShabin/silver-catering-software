import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import TableActions from "../../../components/ui/table/TableActions";

const CustomerCard = React.memo(({ customer, onEdit, onDelete, onView, isOverdue }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:shadow-md hover:shadow-primary-500/5 transition-all group relative"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-base relative">
        {customer.name.charAt(0)}
        {isOverdue && (
          <>
            <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
            </span>
            <div className="absolute bottom-full mb-0.5 left-full -ml-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-xl rounded-bl-none border border-white/90 shadow-lg shadow-rose-500/40 flex items-center gap-1.5 z-20 whitespace-nowrap uppercase tracking-[0.08em] animate-pulse origin-bottom-left">
              <MessageSquare size={10} fill="currentColor" className="opacity-95" />
              <span>Promise Overdue</span>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {customer.isFrequent && (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded-md uppercase tracking-wider">
            Frequent
          </span>
        )}
        <div className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-100 shadow-sm z-10">
          <TableActions 
            onEdit={() => onEdit(customer)}
            onDelete={() => onDelete(customer)}
          />
        </div>
      </div>
    </div>
    <div className="space-y-2">
      <div>
        <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">{customer.name}</h3>
        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
          <Mail size={10} /> {customer.email}
        </p>
      </div>
      <div className="pt-2 border-t border-slate-50 space-y-1">
        <p className="text-[10px] text-slate-500 flex items-center gap-2">
          <Phone size={10} className="text-slate-300" /> {customer.phone}
        </p>
        <p className="text-[10px] text-slate-500 flex items-center gap-2 truncate">
          <MapPin size={10} className="text-slate-300" /> {customer.address || 'No address provided'}
        </p>
      </div>
    </div>
  </motion.div>
));

export default CustomerCard;
