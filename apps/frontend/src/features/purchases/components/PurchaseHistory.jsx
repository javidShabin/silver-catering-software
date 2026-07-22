import React from "react";
import PurchaseMobileCard from "./PurchaseMobileCard";
import { useTranslation } from "react-i18next";

const PurchaseHistory = ({ purchases, isLoading, pagination, onPageChange, onEdit }) => {
  const { t } = useTranslation();
  const statusColors = {
    paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    partial: "bg-amber-50 text-amber-600 border-amber-100",
    pending: "bg-rose-50 text-rose-600 border-rose-100"
  };

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {purchases.map((p) => (
          <PurchaseMobileCard key={p.id} purchase={p} statusColors={statusColors} onEdit={() => onEdit(p)} />
        ))}
      </div>

      {/* Cursor Pagination */}
      {(pagination.hasNextPage || pagination.hasPreviousPage) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{purchases.length}</span> purchases
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={!pagination.hasPreviousPage}
              onClick={pagination.onPreviousPage}
              className="px-4 py-2 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200/60 transition-all font-semibold text-xs"
            >
              Previous
            </button>
            <button 
              disabled={!pagination.hasNextPage}
              onClick={pagination.onNextPage}
              className="px-4 py-2 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200/60 transition-all font-semibold text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
