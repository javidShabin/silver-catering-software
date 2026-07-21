import { CURRENCY } from "../../../config/currency";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseApi } from "../../../api/purchaseApi";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../../components/ui/ConfirmModal";

const PurchaseMobileCard = ({ purchase: p, statusColors, onEdit }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [addExpense, setAddExpense] = React.useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => purchaseApi.deletePurchase(p.id),
    onSuccess: () => {
      toast.success("Purchase deleted");
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to delete purchase")
  });

  const completeMutation = useMutation({
    mutationFn: () => purchaseApi.updatePaymentStatus(p.id, "paid"),
    onSuccess: () => {
      toast.success("Purchase marked as complete");
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setIsCompleteModalOpen(false);
    },
    onError: () => toast.error("Failed to update status")
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleCompleteClick = (e) => {
    e.stopPropagation();
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = () => {
    completeMutation.mutate();
  };

  return (
    <div 
      className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 transition-transform"
    >
      {/* Top Row: Date & Status */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">{new Date(p.purchaseDate).toLocaleDateString()}</span>
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${statusColors[p.paymentStatus]}`}>
          {p.paymentStatus}
        </span>
      </div>
      
      {/* Item Details */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-slate-800">{p.itemName}</h4>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-xs text-slate-500 font-semibold">Qty: {p.quantityPurchased}</span>
            {p.event && (
              <span className="text-[9px] text-primary-600 font-semibold bg-primary-50 w-fit px-1.5 py-0.5 rounded border border-primary-100">
                Event: {p.event.title}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {p.paymentStatus !== "paid" && (
            <button 
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg transition-colors mr-1 whitespace-nowrap shrink-0"
              onClick={handleCompleteClick}
              title="Mark as Paid"
            >
              <CheckCircle size={14} /> <span>Mark Paid</span>
            </button>
          )}
          <button 
            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={() => onEdit(p)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            onClick={handleDelete}
            title="Remove"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 w-full" />

      {/* Bottom Row: Supplier & Total */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
            {p.supplier?.name?.charAt(0) || "S"}
          </div>
          <span className="text-xs text-slate-600 font-medium">{p.supplier?.name || "Legacy Supplier"}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("common.total_amount", "Total Cost")}</span>
          <span className="text-sm font-black text-slate-900">{CURRENCY}{p.totalAmount}</span>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase?"
        confirmText="Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
      <ConfirmModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleConfirmComplete}
        title="Confirm Payment"
        message="Are you sure you want to mark this purchase as Paid?"
        confirmText="Confirm & Mark Paid"
        type="success"
        isLoading={completeMutation.isPending}
        extraOption={{
          label: "Log this as an Expense automatically",
          checked: addExpense,
          onChange: setAddExpense
        }}
      />
    </div>
  );
};

export default memo(PurchaseMobileCard);
