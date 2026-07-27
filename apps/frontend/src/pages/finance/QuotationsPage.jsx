import { CURRENCY } from "../../config/currency";
import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, Calendar, Eye, ArrowLeft, FileText } from "lucide-react";
import PremiumModal from "../../components/ui/PremiumModal";
import QuotationBuilder from "./QuotationBuilder";
import QuotationPreviewModal from "./components/QuotationPreviewModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import api from "../../utils/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const QuotationsPage = () => {
  const { t } = useTranslation();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Page view: 'list' | 'builder'
  const [pageView, setPageView] = useState("list");

  // Builder state
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  // Helper to open builder page
  const openBuilder = (quote = null, viewMode = false) => {
    setSelectedQuoteForEdit(quote);
    setIsViewMode(viewMode);
    setPageView("builder");
  };

  const closeBuilder = () => {
    setPageView("list");
    setSelectedQuoteForEdit(null);
    setIsViewMode(false);
  };
  
  // Convert Form State
  const [convertForm, setConvertForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    guestCount: 0,
    advanceAmount: 0
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/quotations");
      const data = response.data;
      if (data.status === "success") {
        setQuotations(data.data.quotations);
      }
    } catch (error) {
      console.error("Error fetching quotations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDeleteClick = (id) => {
    setQuoteToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete) return;
    try {
      const response = await api.delete(`/quotations/${quoteToDelete}`);
      if (response.status === 200 || response.status === 204) {
        fetchQuotations();
      }
    } catch (error) {
      console.error("Error deleting quotation", error);
    } finally {
      setIsDeleteModalOpen(false);
      setQuoteToDelete(null);
    }
  };

  const openConvertModal = (quote) => {
    setSelectedQuote(quote);
    setConvertForm({
      title: `Event for ${quote.customer?.name || 'Customer'}`,
      date: quote.validUntil.split('T')[0],
      time: "18:00",
      location: "",
      guestCount: quote.guestCount || 50,
      advanceAmount: 0
    });
    setIsConvertOpen(true);
  };

  const queryClient = useQueryClient();

  const handleConvert = async () => {
    try {
      const response = await api.post(`/quotations/${selectedQuote.id}/approve`, convertForm);
      if (response.status === 200 || response.status === 201) {
        setIsConvertOpen(false);
        fetchQuotations();
        queryClient.invalidateQueries(['events']);
        queryClient.invalidateQueries(['invoices']);
      }
    } catch (error) {
      console.error("Error converting quotation", error);
    }
  };

  const filteredQuotations = quotations.filter(q => 
    q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
    (q.customer && q.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  const isExpiringSoon = (quote) => {
    if (quote.status === "approved" || quote.status === "rejected") return false;
    const diffTime = new Date(quote.validUntil).getTime() - new Date().getTime();
    return (diffTime / (1000 * 3600 * 24)) <= 5;
  };

  // ── Builder full-page view ─────────────────────────────────────────────
  if (pageView === "builder") {
    return (
      <div className="space-y-6 pb-10 max-w-7xl mx-auto">
        {/* Builder Page Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={closeBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {isViewMode
                ? "View Quotation Details"
                : selectedQuoteForEdit
                ? "Edit Quotation"
                : t("quotations.create_quotation", "Create Quotation")}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {isViewMode ? "View the details of the selected quotation." : "Draft an estimate for your client."}
            </p>
          </div>
        </div>

        {/* Builder Component - rendered inline as full page */}
        <QuotationBuilder
          key={selectedQuoteForEdit ? selectedQuoteForEdit.id : "new"}
          initialData={selectedQuoteForEdit}
          isViewMode={isViewMode}
          onSuccess={() => {
            toast.success("Quotation saved successfully!");
            closeBuilder();
            fetchQuotations();
          }}
          onClose={closeBuilder}
          onOpenPDF={() => setIsPdfModalOpen(true)}
        />

        {/* PDF Preview Modal */}
        <QuotationPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          quotation={selectedQuoteForEdit}
        />
      </div>
    );
  }

  // ── List page view ─────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{t("quotations.quotations_and_estimations", "Quotations & Estimations")}</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-md mx-auto lg:mx-0">{t("quotations.quotations_subtitle", "Create and manage customer estimates before confirming events.")}</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <div className="w-full flex justify-center sm:w-auto">
            <button 
              onClick={() => openBuilder(null, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50 max-md:bg-primary-600 max-md:hover:bg-primary-500 max-md:shadow-primary-500/25"
            >
              <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("quotations.create_quotation", "Create Quotation")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder={t("quotations.search_quotations", "Search quotations...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="min-h-[400px]">
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto w-full max-md:hidden">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quotation #</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Until</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading quotations...</td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No quotations found.</td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800">{quotation.quotationNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700">{quotation.customer?.name || "Unknown"}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 relative">
                      <div className="inline-flex items-center relative">
                        <span className="text-xs font-medium">{new Date(quotation.validUntil).toLocaleDateString()}</span>
                        {isExpiringSoon(quotation) && (
                          <>
                            <span className="absolute -top-2 -right-3 flex h-3 w-3 z-10">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                            </span>
                            <div className="absolute bottom-full mb-1.5 left-full -ml-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-xl rounded-bl-none border border-white/90 shadow-lg shadow-rose-500/40 flex items-center gap-1.5 z-20 whitespace-nowrap uppercase tracking-[0.08em] animate-pulse origin-bottom-left">
                              <Calendar size={10} fill="currentColor" className="opacity-95 text-rose-500" />
                              <span>Expiring Soon</span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{CURRENCY}{Number(quotation.totalAmount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        quotation.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        quotation.status === "rejected" ? "bg-rose-100 text-rose-700" :
                        quotation.status === "sent" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quotation.status !== "approved" && quotation.status !== "rejected" && (
                          <button 
                            onClick={() => openConvertModal(quotation)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                          >
                            {t("quotations.convert", "CONVERT")}
                          </button>
                        )}
                        <button 
                          onClick={() => openBuilder(quotation, true)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {quotation.status !== "approved" && (
                          <button 
                            onClick={() => openBuilder(quotation, false)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteClick(quotation.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading quotations...</div>
            ) : filteredQuotations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No quotations found.</div>
            ) : (
              filteredQuotations.map((quotation) => (
                <div key={quotation.id} className="p-4 space-y-3 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-900">{quotation.quotationNumber}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{quotation.customer?.name || "Unknown"}</div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        quotation.status === "approved" ? "bg-green-100 text-green-700" :
                        quotation.status === "rejected" ? "bg-red-100 text-red-700" :
                        quotation.status === "sent" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                      {quotation.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-slate-500">
                      <span className="block text-xs uppercase tracking-wider mb-0.5">Valid Until</span>
                      <div className="inline-flex items-center relative">
                        {new Date(quotation.validUntil).toLocaleDateString()}
                        {isExpiringSoon(quotation) && (
                          <>
                            <span className="absolute -top-1 -right-3 flex h-3 w-3 z-10">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                            </span>
                            <div className="absolute bottom-full mb-1 left-full -ml-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-xl rounded-bl-none border border-white/90 shadow-lg shadow-rose-500/40 flex items-center gap-1.5 z-20 whitespace-nowrap uppercase tracking-[0.08em] animate-pulse origin-bottom-left">
                              <Calendar size={10} fill="currentColor" className="opacity-95 text-rose-500" />
                              <span>Expiring Soon</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-slate-500 uppercase tracking-wider mb-0.5">Total Amount</span>
                      <span className="font-semibold text-slate-900">{CURRENCY}{Number(quotation.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex justify-end gap-2">
                    {quotation.status !== "approved" && quotation.status !== "rejected" && (
                      <button 
                        onClick={() => openConvertModal(quotation)}
                        className="px-3 py-1.5 text-xs font-bold bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-md transition-colors"
                      >
                        {t("quotations.convert", "Convert")}
                      </button>
                    )}
                    <button 
                      onClick={() => openBuilder(quotation, true)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {quotation.status !== "approved" && (
                      <button 
                        onClick={() => openBuilder(quotation, false)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(quotation.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PDF Preview Modal (for list-view PDF trigger if needed) */}
      <QuotationPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        quotation={selectedQuoteForEdit}
      />

      {/* Convert Modal */}
      <PremiumModal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        title="Convert to Event"
        description={`Configure details for ${selectedQuote?.quotationNumber}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Event Title</label>
              <input 
                type="text"
                placeholder="e.g. Wedding Reception"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={convertForm.title} 
                onChange={e => setConvertForm({...convertForm, title: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Location</label>
              <input 
                type="text"
                placeholder="e.g. Grand Hall"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={convertForm.location} 
                onChange={e => setConvertForm({...convertForm, location: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <input 
                type="date"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={convertForm.date} 
                onChange={e => setConvertForm({...convertForm, date: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Time</label>
              <input 
                type="time"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={convertForm.time} 
                onChange={e => setConvertForm({...convertForm, time: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Guest Count</label>
              <input 
                type="number"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={convertForm.guestCount} 
                onChange={e => setConvertForm({...convertForm, guestCount: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{`Advance Amount Paid (${CURRENCY}) - Optional`}</label>
              <input 
                type="number"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                value={convertForm.advanceAmount} 
                onChange={e => setConvertForm({...convertForm, advanceAmount: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-100 text-primary-700 text-xs p-3 rounded-lg flex gap-2 items-start mt-2">
            <Calendar size={14} className="shrink-0 mt-0.5" />
            <p>An Invoice for <strong>{CURRENCY}{Number(selectedQuote?.totalAmount || 0).toFixed(2)}</strong> will be automatically generated and linked to this event upon confirmation.</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setIsConvertOpen(false)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button 
              onClick={handleConvert}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer gap-2"
            >
              Confirm Event
            </button>
          </div>
        </div>
      </PremiumModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setQuoteToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default QuotationsPage;
