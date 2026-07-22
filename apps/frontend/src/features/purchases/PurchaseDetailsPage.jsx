import { CURRENCY } from "../../config/currency";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Edit, Truck, IndianRupee, Hash, PackageCheck, Calendar, CreditCard, Receipt } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseApi } from "../../api/purchaseApi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import ConfirmModal from "../../components/ui/ConfirmModal";
import RecordPurchasePaymentModal from "./components/RecordPurchasePaymentModal";

const PurchaseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);

  const { data: purchaseData, isLoading, isError } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseApi.getPurchaseById(id),
    onError: () => {
      toast.error("Failed to load purchase details");
      navigate("/purchases");
    }
  });

  const purchase = purchaseData?.data;

  const deleteMutation = useMutation({
    mutationFn: () => purchaseApi.deletePurchase(id),
    onSuccess: () => {
      toast.success("Purchase deleted");
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setIsDeleteModalOpen(false);
      navigate("/purchases");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete purchase");
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data) => purchaseApi.recordPayment(id, data),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  });

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return <div className="p-6 animate-pulse bg-white rounded-3xl h-[60vh] border border-slate-100 max-w-4xl mx-auto" />;
  }

  if (isError || !purchase) return null;

  const statusColors = {
    "PAID": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "PENDING": "bg-amber-100 text-amber-700 border-amber-200",
    "PARTIAL": "bg-blue-100 text-blue-700 border-blue-200"
  };

  const statusColor = statusColors[purchase.paymentStatus] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto pb-10 space-y-4"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between px-1">
        <button 
          onClick={() => navigate("/purchases")}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2">
          {Number(purchase.balanceAmount) > 0 && (
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-md rounded-lg text-[11px] font-bold transition-all border border-emerald-100"
            >
              <IndianRupee size={14} /> <span className="max-md:hidden">Record Payment</span>
            </button>
          )}
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-md rounded-lg text-[11px] font-bold transition-all border border-rose-100"
          >
            <Trash2 size={14} /> <span className="max-md:hidden">Delete Record</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 shrink-0">
                <Receipt size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 inline-block px-2 py-0.5 rounded-md">Purchase Receipt</p>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800 tracking-tight">{purchase.itemName}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-left md:text-right bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  {CURRENCY}{purchase.totalAmount}
                </h2>
              </div>
              <div className="flex gap-4 md:justify-end mt-2">
                <div>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Paid</p>
                  <p className="text-sm font-bold text-emerald-600">{CURRENCY}{purchase.advancePaid || "0.00"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest">Balance</p>
                  <p className="text-sm font-bold text-rose-600">{CURRENCY}{purchase.balanceAmount || "0.00"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column - Details */}
            <div className="md:col-span-7 space-y-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <PackageCheck size={14} className="text-primary-500" /> Purchase Details
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Hash size={12} className="text-slate-400" /> Quantity
                  </p>
                  <p className="text-base sm:text-lg font-black text-slate-800">
                    {purchase.quantityPurchased}
                  </p>
                </div>
                
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <IndianRupee size={12} className="text-slate-400" /> Unit Cost
                  </p>
                  <p className="text-base sm:text-lg font-black text-slate-800">
                    {CURRENCY}{purchase.unitCost}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" /> Date
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {new Date(purchase.purchaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <CreditCard size={12} className="text-slate-400" /> Status
                  </p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${statusColor}`}>
                    {purchase.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Supplier */}
            <div className="md:col-span-5">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 sm:p-6 text-white h-full relative overflow-hidden shadow-lg shadow-slate-900/20">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/20 rounded-full blur-xl translate-y-1/3 -translate-x-1/3"></div>

                <div className="relative z-10">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Truck size={12} className="text-slate-400" /> Supplier Info
                  </h3>
                  
                  {purchase.supplier ? (
                    <div className="space-y-4">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white mb-3 border border-white/10">
                          <Truck size={20} />
                        </div>
                        <p className="text-base sm:text-lg font-black text-white mb-0.5">{purchase.supplier.name}</p>
                        <p className="text-[11px] text-slate-300 font-medium">{purchase.supplier.phone}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Details</p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {purchase.supplier.address || "No address provided."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-center space-y-2 opacity-60">
                      <Truck size={24} />
                      <p className="text-xs font-medium">No supplier linked</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      {purchase.paymentHistory && purchase.paymentHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/40 border border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <CreditCard size={14} className="text-primary-500" /> Payment History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference</th>
                </tr>
              </thead>
              <tbody>
                {purchase.paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 text-xs font-bold text-slate-700">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-xs font-black text-emerald-600">
                      {CURRENCY}{payment.amount}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {payment.method}
                      </span>
                    </td>
                    <td className="py-3 text-xs font-medium text-slate-500">
                      {payment.reference || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase?"
        confirmText="Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
      <RecordPurchasePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        purchase={purchase}
        recordPaymentMutation={recordPaymentMutation}
      />
    </motion.div>
  );
};

export default PurchaseDetailsPage;
