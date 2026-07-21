import { CURRENCY } from "../../config/currency";
import React from "react";
import PremiumModal from "../../components/ui/PremiumModal";
import { Toaster } from "react-hot-toast";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Search,
  MoreVertical,
  Download,
  Briefcase,
  Send
} from "lucide-react";
import CreateInvoiceForm from "./components/CreateInvoiceForm";
import InvoicePreviewModal from "../../components/billing/InvoicePreviewModal";
import SummaryCard from "./components/SummaryCard";
import { useBillingManagement } from "./hooks/useBillingManagement";
import { useTranslation } from "react-i18next";

const statusColors = {
  paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
  "partially-paid": "bg-amber-50 text-amber-600 border-amber-100",
  pending: "bg-rose-50 text-rose-600 border-rose-100",
  draft: "bg-slate-50 text-slate-500 border-slate-100",
  sent: "bg-primary-50 text-primary-600 border-primary-100"
};

const BillingPage = () => {
  const { t } = useTranslation();
  const {
    invoices, isLoading, search, setSearch,
    statusFilter, setStatusFilter, cursor, setCursor, setCursorsStack,
    isModalOpen, setIsModalOpen,
    selectedInvoice, isPreviewOpen, setIsPreviewOpen,
    stats,
    handleCreateInvoice, handlePreviewInvoice, handleWhatsAppShare,
    pagination
  } = useBillingManagement();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{t("billing.billing_and_payments", "Billing & Payments")}</h1>
          <p className="text-xs text-slate-500">{t("billing.billing_subtitle", "Track catering revenue and automated event invoicing.")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title={t("billing.total_invoiced", "Total Invoiced")} value={stats.total} icon={FileText} color="bg-primary-500" trend="+12.5%" />
        <SummaryCard title={t("billing.payments_received", "Payments Received")} value={stats.received} icon={CheckCircle2} color="bg-emerald-500" trend="+8.2%" />
        <SummaryCard title={t("billing.pending_balance", "Pending Balance")} value={stats.pending} icon={Clock} color="bg-rose-500" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder={t("billing.search_invoices", "Search invoices...")}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCursor(null); setCursorsStack([]); }}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {["all", "paid", "partially-paid", "pending", "sent"].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCursor(null); setCursorsStack([]); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                statusFilter === status 
                ? 'bg-white text-slate-900 border-slate-900 shadow-sm' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-650'
              }`}
            >
              {status.toUpperCase().replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Event Name</th>
                <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
                <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Balance</th>
                <th className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-5 h-12 bg-white" />
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 grayscale opacity-30">
                      <Briefcase size={40} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial records empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{inv.invoiceNumber}</span>
                        <span className="text-[9px] text-slate-400 font-medium">Issue: {new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-bold text-slate-800">
                        {inv.event?.title || <span className="text-slate-400 italic font-medium">Manual Invoice</span>}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-semibold text-slate-700">{inv.customer?.name || "Client"}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-xs font-black text-slate-900">{CURRENCY}{Number(inv.totalAmount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold ${Number(inv.balanceAmount) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {CURRENCY}{Number(inv.balanceAmount).toLocaleString()}
                        </span>
                        {Number(inv.advancePaid) > 0 && (
                          <span className="text-[9px] text-slate-400 font-medium opacity-70">Paid: {CURRENCY}{Number(inv.advancePaid).toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold border uppercase tracking-wider ${statusColors[inv.status] || statusColors.pending}`}>
                        {inv.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleWhatsAppShare(inv)}
                          className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Share via WhatsApp"
                        >
                          <Send size={14} />
                        </button>
                        <button 
                          onClick={() => handlePreviewInvoice(inv)}
                          className="p-1.5 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="View & Export"
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          onClick={() => handlePreviewInvoice(inv)}
                          className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                          title="Payment & Invoice Details"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view: Beautiful Card List */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 p-4 animate-pulse"></div>
          ))
        ) : invoices.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
            <div className="flex flex-col items-center gap-2 grayscale opacity-30">
              <Briefcase size={32} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial records empty</p>
            </div>
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
              {/* Top Row: Invoice No & Status */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">{inv.invoiceNumber}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold border uppercase tracking-wider ${statusColors[inv.status] || statusColors.pending}`}>
                  {inv.status.replace('-', ' ')}
                </span>
              </div>
              
              {/* Event Title & Client */}
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {inv.event?.title || <span className="text-slate-400 italic font-medium">Manual Invoice</span>}
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{inv.customer?.name || "Client"}</p>
              </div>

              {/* Dividers */}
              <div className="h-px bg-slate-100 w-full" />

              {/* Financial amounts */}
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
                  <span className="text-xs font-black text-slate-900">{CURRENCY}{Number(inv.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Balance Due</span>
                  <span className={`text-xs font-bold ${Number(inv.balanceAmount) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {CURRENCY}{Number(inv.balanceAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer: Date & Actions */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-slate-400 font-medium">Issued: {new Date(inv.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleWhatsAppShare(inv)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[9px] font-bold transition-all"
                  >
                    <Send size={10} />
                  </button>
                  <button 
                    onClick={() => handlePreviewInvoice(inv)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg text-[9px] font-bold transition-all"
                  >
                    <Download size={10} /> Get Invoice
                  </button>
                  <button 
                    onClick={() => handlePreviewInvoice(inv)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cursor Pagination */}
      {(pagination.hasNextPage || pagination.hasPreviousPage) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{invoices.length}</span> invoices
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


      <InvoicePreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={selectedInvoice}
      />
      <Toaster position="top-right" />
    </div>
  );
};

export default BillingPage;
