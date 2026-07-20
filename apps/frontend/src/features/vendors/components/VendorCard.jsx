import React from "react";
import { Star, Phone, Mail, IndianRupee, MapPin, Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const VendorCard = ({ vendor, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all group flex flex-col h-full p-4 relative">
      <div className="flex items-start justify-between mb-3">
        <div className="pr-12">
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary-600 transition-colors truncate">
            {vendor.name}
          </h3>
          <span className="text-xs text-slate-500">
            {vendor.category}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3">
          <button 
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Phone size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{vendor.contactPerson} - {vendor.phone}</span>
        </div>
        
        {vendor.email && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{vendor.email}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-500">{t("common.outstanding", "Balance Due")}</span>
        <div className={`text-sm font-bold flex items-center ${vendor.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
          <IndianRupee size={12} className="mr-0.5" />
          {Number(vendor.balanceDue || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
