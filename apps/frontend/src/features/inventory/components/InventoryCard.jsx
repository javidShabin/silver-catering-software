import React from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle } from "lucide-react";
import TableActions from "../../../components/ui/table/TableActions";
import { useTranslation } from "react-i18next";

const statusColors = {
  "In Stock": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Low Stock": "bg-amber-50 text-amber-600 border-amber-100",
  "Out of Stock": "bg-rose-50 text-rose-600 border-rose-100"
};

const InventoryCard = React.memo(({ item, onUpdateStock, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-slate-100 p-1.5 sm:p-2 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="p-1 bg-slate-50 rounded-md group-hover:bg-primary-50 transition-colors shrink-0">
          <Package size={12} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold border whitespace-nowrap ${statusColors[item.status]}`}>
            {item.status === "In Stock" ? t("common.in_stock", "IN STOCK") : item.status === "Low Stock" ? t("common.low_stock", "LOW STOCK") : t("common.out_of_stock", "OUT OF STOCK")}
          </span>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-100 shadow-sm p-0.5">
            <TableActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
          </div>
        </div>
      </div>

      <div className="space-y-0.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors truncate leading-tight">{item.name}</h3>
          <p className="text-[9px] text-slate-400 font-medium">{item.category}</p>
        </div>

        <div className="space-y-0.5 pt-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t("common.current_stock", "Current Stock")}</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-black text-slate-900">{item.quantity}</span>
                <span className="text-[10px] font-semibold text-slate-500">{item.unit}</span>
              </div>
            </div>
            {Number(item.rentPerDay) > 0 && (
              <div className="text-right">
                <p className="text-[8px] font-bold text-primary-400 uppercase tracking-widest leading-none mb-0.5">{t("common.rent_per_day", "Rent/Day")}</p>
                <div className="flex items-baseline gap-0.5 justify-end">
                  <span className="text-sm font-black text-primary-600">₹{item.rentPerDay}</span>
                </div>
              </div>
            )}
          </div>

          {item.status === 'Low Stock' && (
            <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 rounded-lg text-[8px] sm:text-[9px] font-bold text-amber-600 border border-amber-100/50 animate-pulse w-full">
              <AlertTriangle size={10} className="shrink-0" />
              <span>{t("common.low_stock_alert", "LOW STOCK ALERT")}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default InventoryCard;
