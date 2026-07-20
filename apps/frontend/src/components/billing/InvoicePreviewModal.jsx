import { CURRENCY } from "../../config/currency";
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, Share2, ShieldCheck, Mail } from "lucide-react";
import InvoiceTemplate from "./InvoiceTemplate";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";


const InvoicePreviewModal = ({ isOpen, onClose, invoice }) => {
  const invoiceRef = useRef();
  const [viewMode, setViewMode] = React.useState("client");

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber}`,
  });

  const generatePDFBlob = async () => {
    const element = document.getElementById("invoice-printable");
    if (!element) throw new Error("Invoice element not found");

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf")
    ]);

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    return pdf.output("blob");
  };

  const handleDownload = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });
      const blob = await generatePDFBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice?.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to generate PDF.", { id: "pdf-download" });
    }
  };

  const handleCopyShareableLink = () => {
    const shareUrl = `${window.location.origin}/billing?search=${encodeURIComponent(invoice?.invoiceNumber)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Shareable invoice link copied to clipboard!");
  };

  const handleWhatsAppClient = () => {
    if (!invoice?.customer?.phone) {
      toast.error("No phone number registered for this client.");
      return;
    }
    const shareUrl = `${window.location.origin}/billing?search=${encodeURIComponent(invoice?.invoiceNumber)}`;
    const phone = invoice.customer.phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Hello ${invoice.customer.name},\n\nHere are the details of your invoice (${invoice.invoiceNumber}) for the upcoming event.\n\nTotal Amount: ${CURRENCY}${invoice.totalAmount.toLocaleString()}\nBalance Due: ${CURRENCY}${invoice.balanceAmount.toLocaleString()}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n🔗 *View Invoice:* \n${shareUrl}\n\nThank you for choosing DoCaterPro!`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleEmailClient = () => {
    if (!invoice?.customer?.email) {
      toast.error("No email address registered for this client.");
      return;
    }
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from DoCaterPro`);
    const body = encodeURIComponent(`Dear ${invoice.customer.name},\n\nPlease find attached/below the invoice details for your event:\n\nInvoice Number: ${invoice.invoiceNumber}\nTotal Amount: ${CURRENCY}${invoice.totalAmount.toLocaleString()}\nBalance Due: ${CURRENCY}${invoice.balanceAmount.toLocaleString()}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nWarm regards,\nDoCaterPro Billing Team`);
    window.location.href = `mailto:${invoice.customer.email}?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    const shareUrl = `${window.location.origin}/billing?search=${encodeURIComponent(invoice?.invoiceNumber)}`;
    let fileShared = false;

    try {
      if (navigator.canShare) {
        toast.loading("Preparing PDF for sharing...", { id: "pdf-share" });
        const blob = await generatePDFBlob();
        const file = new File([blob], `Invoice-${invoice?.invoiceNumber}.pdf`, { type: "application/pdf" });
        
        if (navigator.canShare({ files: [file] })) {
          toast.dismiss("pdf-share");
          await navigator.share({
            title: `Invoice ${invoice?.invoiceNumber}`,
            text: `Here is the invoice ${invoice?.invoiceNumber}.`,
            files: [file]
          });
          fileShared = true;
          return;
        }
        toast.dismiss("pdf-share");
      }
    } catch (err) {
      toast.dismiss("pdf-share");
      if (err.name === 'AbortError') {
        // User intentionally cancelled the native share dialog
        return;
      }
      console.warn("Could not share file natively, falling back to URL...", err);
    }

    if (!fileShared) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `Invoice ${invoice?.invoiceNumber}`,
            text: `Here is the invoice ${invoice?.invoiceNumber}.`,
            url: shareUrl
          });
        } else {
          toast("Native sharing not supported on this browser. Use Copy Link instead.", { icon: "ℹ️", duration: 4000 });
        }
      } catch (fallbackErr) {
        if (fallbackErr.name !== 'AbortError') {
          console.error("Fallback share error:", fallbackErr);
          toast.error("Could not share invoice.");
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
      <div key="modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl h-[85vh] bg-slate-50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all print:hidden"
          >
            <X size={18} />
          </button>
          <div className="flex flex-wrap items-center justify-between px-6 py-4 pr-14 bg-white border-b border-slate-200 relative z-10 print:hidden gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">Invoice Preview</h2>
                <p className="text-[10px] text-slate-500 font-medium">{invoice?.invoiceNumber} • Ready for export</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                <button
                  onClick={() => setViewMode("client")}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${viewMode === 'client' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Client View
                </button>
                <button
                  onClick={() => setViewMode("owner")}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${viewMode === 'owner' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Owner View
                </button>
              </div>

              <button
                onClick={handleNativeShare}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <Printer size={14} />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-95"
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
            <div className="print:m-0">
              <InvoiceTemplate ref={invoiceRef} invoice={invoice} viewMode={viewMode} />
            </div>
            
            <div className="max-w-[720px] mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Mail size={14} className="text-primary-500" />
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button 
                    onClick={handleWhatsAppClient}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100 flex items-center gap-2"
                  >
                    Send via WhatsApp
                  </button>
                  <button 
                    onClick={handleEmailClient}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                  >
                    Email to Client
                  </button>
                  <button 
                    onClick={handleCopyShareableLink}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                  >
                    Copy Shareable Link
                  </button>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Share2 size={14} className="text-primary-500" />
                  Audit Trail
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This invoice was generated on {new Date(invoice?.createdAt).toLocaleString()}. 
                  Any changes made to the event or billing details will be reflected in a new version.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
    </AnimatePresence>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-printable, #invoice-printable * { visibility: visible; }
          #invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            box-shadow: none;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </>
  );
};

export default InvoicePreviewModal;
