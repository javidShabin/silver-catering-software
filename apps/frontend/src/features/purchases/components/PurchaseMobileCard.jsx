import { CURRENCY } from "../../../config/currency";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseApi } from "../../../api/purchaseApi";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import RecordPurchasePaymentModal from "./RecordPurchasePaymentModal";

const PurchaseMobileCard = ({ purchase: p, statusColors, onEdit }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => purchaseApi.deletePurchase(p.id),
    onSuccess: () => {
      toast.success("Purchase deleted");
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to delete purchase")
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data) => purchaseApi.recordPayment(p.id, data),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setIsCompleteModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to record payment")
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

  return (
    <div 
      className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2 transition-transform"
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

      {/* Bottom Row: Supplier, Paid, Balance, Total */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
              {p.supplier?.name?.charAt(0) || "S"}
            </div>
            <span className="text-[11px] text-slate-600 font-medium">{p.supplier?.name || "Legacy Supplier"}</span>
          </div>
          
          {p.paymentHistory && p.paymentHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="text-[9px] font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-md border border-primary-200"
            >
              View History
            </button>
          )}
        </div>
        
        <div className="flex justify-between items-end bg-slate-50/50 p-2 rounded-lg border border-slate-50">
          <div className="text-left">
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block">Paid</span>
            <span className="text-[11px] font-bold text-emerald-600">{CURRENCY}{p.advancePaid || "0.00"}</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Balance</span>
            <span className="text-[11px] font-bold text-rose-600">{CURRENCY}{p.balanceAmount || "0.00"}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{t("common.total_amount", "Total")}</span>
            <span className="text-xs font-black text-slate-900">{CURRENCY}{p.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Payment History Modal */}
      {showHistory && p.paymentHistory && p.paymentHistory.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowHistory(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Payment History</h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-800 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100">&times;</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {p.paymentHistory.map(hist => (
                <div key={hist.id} className="flex justify-between items-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-600">{new Date(hist.paymentDate).toLocaleDateString()} &bull; {hist.method}</span>
                  <span className="font-black text-emerald-600">{CURRENCY}{hist.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
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
      <RecordPurchasePaymentModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        purchase={p}
        recordPaymentMutation={recordPaymentMutation}
      />
    </div>
  );
};

export default memo(PurchaseMobileCard);
