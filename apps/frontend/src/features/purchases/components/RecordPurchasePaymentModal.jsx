import React, { useState } from "react";
import Modal from "../../../components/ui/PremiumModal";
import { toast } from "react-hot-toast";

const RecordPurchasePaymentModal = ({ isOpen, onClose, purchase, recordPaymentMutation }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }
    
    const maxAmount = Number(purchase?.balanceAmount) > 0 
      ? Number(purchase.balanceAmount) 
      : Number(purchase?.totalAmount || 0);

    if (Number(amount) > maxAmount) {
      return toast.error("Amount cannot exceed the total/balance amount");
    }
    
    recordPaymentMutation.mutate(
      { amount, method, date },
      {
        onSuccess: () => {
          setAmount("");
          setMethod("Cash");
          setDate(new Date().toISOString().split('T')[0]);
          onClose();
        }
      }
    );
  };

  const maxAmount = Number(purchase?.balanceAmount) > 0 
    ? Number(purchase.balanceAmount) 
    : Number(purchase?.totalAmount || 0);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Record Payment" 
      description="Record a new payment for this purchase."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Amount */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Amount</label>
              <span className="text-[10px] text-primary-600 font-bold">Balance: {maxAmount}</span>
            </div>
            <input
              autoFocus
              type="number"
              placeholder="0.00"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              max={maxAmount}
              step="0.01"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Payment Method</label>
            <select
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Date</label>
            <input
              type="date"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={recordPaymentMutation.isPending}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer gap-2"
          >
            {recordPaymentMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Record Payment"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPurchasePaymentModal;
