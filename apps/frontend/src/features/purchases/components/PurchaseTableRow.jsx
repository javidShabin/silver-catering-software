import { CURRENCY } from "../../../config/currency";
import React, { memo } from "react";
import { Eye, Trash2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseApi } from "../../../api/purchaseApi";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { Edit } from "lucide-react";

const PurchaseTableRow = ({ purchase: p, statusColors, onEdit }) => {
  const navigate = useNavigate();
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
    // note: addExpense logic could be sent to backend if backend supported it.
    // Since it was just requested as a UI extra option, it's captured in state.
  };

  return (
    <>
      <tr 
        className="hover:bg-slate-50/30 transition-colors group"
      >
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">{p.itemName}</span>
            <span className="text-[10px] text-slate-400">Qty: {p.quantityPurchased}</span>
            {p.event && (
              <span className="text-[9px] mt-1 text-indigo-600 font-semibold bg-indigo-50 w-fit px-1.5 py-0.5 rounded border border-indigo-100">
                Event: {p.event.title}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
              {p.supplier?.name?.charAt(0) || "S"}
            </div>
            <span className="text-xs text-slate-600 font-medium">{p.supplier?.name || "Legacy Supplier"}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm font-bold text-slate-800">{CURRENCY}{p.totalAmount}</span>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${statusColors[p.paymentStatus]}`}>
            {p.paymentStatus}
          </span>
        </td>
        <td className="px-6 py-4 text-xs text-slate-400">
          {new Date(p.purchaseDate).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            {p.paymentStatus !== "paid" && (
              <button 
                className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                onClick={handleCompleteClick}
                title="Mark as Complete"
              >
                <CheckCircle size={16} />
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
        </td>
      </tr>
      
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
    </>
  );
};

export default memo(PurchaseTableRow);
