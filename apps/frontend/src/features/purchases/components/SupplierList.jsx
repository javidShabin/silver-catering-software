import React from "react";
import { motion } from "framer-motion";
import { Building2, Star, User, Phone, MapPin } from "lucide-react";

const SupplierList = ({ suppliers, isLoading, onEdit }) => {
  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {suppliers.map((s) => (
        <motion.div 
          key={s.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:shadow-primary-500/5 transition-all group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
              <Building2 size={20} />
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className={`${i < s.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-primary-600 transition-colors">{s.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.category}</p>
            </div>
            
            <div className="pt-3 border-t border-slate-50 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <User size={12} className="text-slate-300" /> {s.contactPerson}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Phone size={12} className="text-slate-300" /> {s.phone}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                <MapPin size={12} className="text-slate-300" /> {s.address || "No address provided"}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SupplierList;
