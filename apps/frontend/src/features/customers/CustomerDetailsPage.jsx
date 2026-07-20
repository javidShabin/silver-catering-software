import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard, Clock, CheckCircle, IndianRupee, Download, ChevronRight, History, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { customerApi } from "../../api/customerApi";
import { billingApi } from "../../api/billingApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DatePicker from "../../components/ui/DatePicker";
import Modal from "../../components/ui/Modal";

import { generateInvoicePdf } from "./utils/generateInvoicePdf";

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [promisedDate, setPromisedDate] = useState("");
  const [dateLoading, setDateLoading] = useState(false);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getSummary(id);
      if (res.status === "success") {
        setCustomer(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load customer details");
      navigate("/customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomerDetails();
  }, [id]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    try {
      setPaymentLoading(true);
      await billingApi.recordPayment(selectedInvoice.id, {
        amount: Number(paymentAmount),
        method: paymentMethod,
        reference: paymentRef
      });
      toast.success("Payment recorded successfully");
      setPaymentModalOpen(false);
      setPaymentAmount("");
      setPaymentRef("");
      fetchCustomerDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSetPromisedDate = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    try {
      setDateLoading(true);
      await billingApi.setPromisedDate(selectedInvoice.id, promisedDate);
      toast.success("Promised date updated");
      setDateModalOpen(false);
      setPromisedDate("");
      fetchCustomerDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set promised date");
    } finally {
      setDateLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      toast.loading("Fetching invoice data...", { id: "pdf-gen" });
      const res = await billingApi.getOne(invoiceId);
      if (res.status === "success" && res.data) {
        toast.loading("Generating PDF...", { id: "pdf-gen" });
        await generateInvoicePdf(res.data);
        toast.success("PDF generated successfully", { id: "pdf-gen" });
      } else {
        toast.error("Could not fetch invoice details", { id: "pdf-gen" });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to generate PDF", { id: "pdf-gen" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <span className="loading loading-spinner loading-lg text-primary-500"></span>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header and Customer Info */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => navigate("/customers")}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-0.5">{customer.name}</h1>
            <p className="text-slate-500 text-xs">Customer Details</p>
            {customer.notes && (
              <p className="mt-2 text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 inline-block">
                <span className="font-semibold text-amber-800/70">Notes:</span> {customer.notes}
              </p>
            )}
          </div>
        </div>

        {/* Customer Contact Details */}
        <div className="flex flex-col sm:flex-row gap-3 text-xs text-slate-600 md:items-center mt-2 md:mt-0">
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-slate-400" />
            <span className="font-medium text-slate-800">{customer.phone || "N/A"}</span>
          </div>
          <div className="hidden sm:block w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Mail size={12} className="text-slate-400" />
            <span>{customer.email || "N/A"}</span>
          </div>
          <div className="hidden sm:block w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5 max-w-[200px]">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{customer.address || "No address"}</span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Event History</h2>
          <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
            {customer.events?.length || 0} Events
          </span>
        </div>
        
        {(!customer.events || customer.events.length === 0) ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm">
            No events found for this customer.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {customer.events.map(event => {
              const invoice = event.invoices?.[0];
              
              let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
              if (invoice) {
                if (invoice.status === "paid") statusColor = "bg-green-50 text-green-700 border-green-200";
                else if (invoice.status === "partially-paid") statusColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
                else if (invoice.status === "overdue") statusColor = "bg-red-50 text-red-700 border-red-200";
              }

              return (
                <div key={event.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row transition-colors hover:border-slate-300">
                  
                  {/* Left Side: Event Details */}
                  <div className="p-3 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center bg-slate-50/30">
                    <h3 className="font-bold text-[13px] text-slate-900 mb-1.5">{event.title}</h3>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="font-medium text-slate-800">{new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin size={12} className="mt-0.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Side: Billing Summary */}
                  <div className="p-3 md:w-2/3 flex flex-col justify-between">
                    {invoice ? (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                            {invoice.status.replace('-', ' ')}
                          </div>
                          
                          {invoice.promisedPaymentDate && Number(invoice.balanceAmount) > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                              <Clock size={12} />
                              Promised: {new Date(invoice.promisedPaymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
                            <p className="text-sm font-bold text-slate-900 flex items-center">
                              <IndianRupee size={12} className="mr-0.5" />{Number(invoice.totalAmount).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Paid</p>
                            <p className="text-sm font-bold text-green-600 flex items-center">
                              <IndianRupee size={12} className="mr-0.5" />{Number(invoice.advancePaid).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Pending</p>
                            <p className={`text-sm font-bold flex items-center ${Number(invoice.balanceAmount) > 0 ? "text-red-600" : "text-slate-900"}`}>
                              <IndianRupee size={12} className="mr-0.5" />{Number(invoice.balanceAmount).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {Number(invoice.balanceAmount) > 0 && (
                            <>
                              <button 
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setPaymentAmount("");
                                  setPaymentModalOpen(true);
                                }}
                              >
                                <CreditCard size={14} /> Record Payment
                              </button>
                              <button 
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setPromisedDate(invoice.promisedPaymentDate ? new Date(invoice.promisedPaymentDate).toISOString().split('T')[0] : "");
                                  setDateModalOpen(true);
                                }}
                              >
                                <Clock size={14} /> Promise Date
                              </button>
                            </>
                          )}
                          <div className="flex items-center ml-auto gap-2">
                            {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                              <button 
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setHistoryModalOpen(true);
                                }}
                              >
                                <History size={14} /> History
                              </button>
                            )}
                            <button 
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download size={14} /> PDF
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4">
                        <FileText size={24} className="mb-1 text-slate-300" />
                        <p className="text-xs">No invoice created.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} className="space-y-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
            <p className="text-xs text-slate-500 font-medium mb-1">Outstanding Balance</p>
            <p className="text-xl font-bold text-slate-900 flex items-center">
              <IndianRupee size={18} className="mr-1" />
              {selectedInvoice ? Number(selectedInvoice.balanceAmount).toLocaleString() : 0}
            </p>
          </div>
          
          <Input 
            label="Payment Amount" 
            type="number" 
            step="any"
            required 
            min="1"
            max={selectedInvoice?.balanceAmount}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder={`Max ₹${selectedInvoice ? Number(selectedInvoice.balanceAmount).toLocaleString() : 0}`}
          />
          
          <div className="form-control w-full">
            <label className="label"><span className="label-text text-xs font-medium text-slate-700">Payment Method</span></label>
            <select 
              className="select select-bordered select-md w-full bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm h-10 min-h-[40px]" 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          
          <Input 
            label="Reference ID (Optional)" 
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="Transaction ID, etc."
          />
          
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={paymentLoading}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Set Promised Date Modal */}
      <Modal isOpen={dateModalOpen} onClose={() => setDateModalOpen(false)} title="Set Promised Date">
        <form onSubmit={handleSetPromisedDate} className="space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl text-slate-600 dark:text-slate-300 text-[13px] mb-4 border border-slate-200 dark:border-slate-700/50 leading-relaxed">
            Set a future date for when the customer promises to pay <strong className="font-semibold text-slate-900 dark:text-white">₹{selectedInvoice ? Number(selectedInvoice.balanceAmount).toLocaleString() : 0}</strong>.
          </div>
          
          <DatePicker 
            label="Promised Date" 
            required 
            min={new Date().toISOString().split('T')[0]}
            value={promisedDate}
            onChange={(e) => setPromisedDate(e.target.value)}
          />
          
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setDateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={dateLoading}>Confirm</Button>
          </div>
        </form>
      </Modal>

      {/* Payment History Modal */}
      <Modal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Payment History">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {selectedInvoice?.paymentHistory?.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">{payment.paymentMethod}</span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {payment.referenceId ? ` • Ref: ${payment.referenceId}` : ''}
                </span>
              </div>
              <span className="font-black text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                +<IndianRupee size={12} className="mx-0.5" />{Number(payment.amount).toLocaleString()}
              </span>
            </div>
          ))}
          
          {(!selectedInvoice?.paymentHistory || selectedInvoice.paymentHistory.length === 0) && (
            <div className="text-center py-6 text-slate-500 text-sm">
              No payments recorded yet.
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default CustomerDetailsPage;
