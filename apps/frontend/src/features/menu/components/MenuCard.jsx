import { CURRENCY } from "../../../config/currency";
import React from "react";
import { motion } from "framer-motion";
import { Utensils, IceCream, Coffee, Soup, Sparkles } from "lucide-react";
import TableActions from "../../../components/ui/table/TableActions";

const MenuCard = React.memo(({ item, onEdit, onDelete }) => {
  const categoryIcons = {
    "Starters": Soup,
    "Main Course": Utensils,
    "Desserts": IceCream,
    "Beverages": Coffee,
    "Snacks": Sparkles
  };
  
  const Icon = categoryIcons[item.category] || Utensils;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all group flex flex-col justify-between h-full relative overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between mb-3 mt-0">
          <div className="p-1.5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl group-hover:from-primary-50 group-hover:to-primary-100 transition-all shadow-sm border border-slate-100/50 group-hover:border-primary-200 shrink-0">
            <Icon size={16} className="text-slate-500 group-hover:text-primary-600 transition-colors sm:w-[20px] sm:h-[20px]" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold border shadow-sm ${item.isAvailable ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 shadow-emerald-500/5' : 'bg-rose-50 text-rose-600 border-rose-200/60 shadow-rose-500/5'}`}>
              {item.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-100 shadow-sm z-10">
              <TableActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-base group-hover:text-primary-600 transition-colors line-clamp-1">{item.name}</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">{item.description || "No description provided."}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {item.dietaryTags?.map(tag => tag !== 'None' && (
              <span key={tag} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-[8px] font-bold text-slate-600 rounded-md border border-slate-200/60 transition-colors">
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{item.category}</span>
        <div className="text-right">
          <span className="text-[14px] font-black text-slate-800">{CURRENCY}{Number(item.minPrice || 0).toFixed(2)}</span>
          {item.unit !== "no_unit" && item.unit !== "none" && item.unit !== "NO_UNIT" && (
            <span className="text-[10px] font-semibold text-slate-400 ml-1">/ {item.unit || "plate"}</span>
          )}
        </div>
      </div>

    </motion.div>
  );
});

export default MenuCard;
