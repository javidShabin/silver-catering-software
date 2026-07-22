import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, Share2, ShieldCheck, Mail } from "lucide-react";
import QuotationTemplate from "./QuotationTemplate";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";


const QuotationPreviewModal = ({ isOpen, onClose, quotation }) => {
  const quotationRef = useRef();
  const [enrichedQuotation, setEnrichedQuotation] = useState(null);

  useEffect(() => {
    if (isOpen && quotation) {
      const enrich = async () => {
        try {
          const { inventoryApi } = await import("../../../api/inventoryApi");
          const invRes = await inventoryApi.getLookup();
          if (invRes.status === "success") {
            const inventoryList = invRes.data || [];
            
            let allocations = quotation.inventoryAllocations;
            if (typeof allocations === "string") {
              try { allocations = JSON.parse(allocations); } catch (e) { allocations = []; }
            }
            if (!Array.isArray(allocations)) allocations = [];

            const enrichedAllocations = allocations.map(alloc => {
              const inv = inventoryList.find(i => i.id === alloc.inventoryId);
              const savedRent = alloc.rentPerDay;
              const currentRent = inv ? Number(inv.rentPerDay || 0) : 0;
              return {
                ...alloc,
                rentPerDay: savedRent !== undefined && savedRent !== null ? Number(savedRent) : currentRent
              };
            });

            // We must also update subtotal to include these dynamically if they weren't before?
            // Actually, QuotationTemplate does NOT calculate subtotal! It just displays quotation.subtotal.
            // But line items WILL show the correct rate now! Wait!
            // If the subtotal in `quotation.subtotal` does not include them, it will be mismatched.
            // But as we saw, the subtotal is already CORRECT. The user said subtotal was 2250 which was correct, but line item was 0.
            
            setEnrichedQuotation({
              ...quotation,
              inventoryAllocations: enrichedAllocations
            });
          } else {
            setEnrichedQuotation(quotation);
          }
        } catch (error) {
          console.error("Failed to enrich quotation", error);
          setEnrichedQuotation(quotation);
        }
      };
      enrich();
    } else {
      setEnrichedQuotation(null);
    }
  }, [isOpen, quotation]);

  const handlePrint = useReactToPrint({
    contentRef: quotationRef,
    documentTitle: `Quotation-${enrichedQuotation?.quotationNumber || 'Document'}`,
  });

  const generatePDFBlob = async () => {
    const element = document.getElementById("quotation-printable");
    if (!element) throw new Error("Quotation element not found");

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
      link.download = `Quotation-${quotation?.quotationNumber}.pdf`;
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
    const shareUrl = `${window.location.origin}/quotations?search=${encodeURIComponent(quotation?.quotationNumber)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Shareable link copied to clipboard!");
  };

  const handleNativeShare = async () => {
    const shareUrl = `${window.location.origin}/quotations?search=${encodeURIComponent(quotation?.quotationNumber)}`;
    let fileShared = false;

    try {
      if (navigator.canShare) {
        toast.loading("Preparing PDF for sharing...", { id: "pdf-share" });
        const blob = await generatePDFBlob();
        const file = new File([blob], `Quotation-${quotation?.quotationNumber}.pdf`, { type: "application/pdf" });
        
        if (navigator.canShare({ files: [file] })) {
          toast.dismiss("pdf-share");
          await navigator.share({
            title: `Quotation ${quotation?.quotationNumber}`,
            text: `Here is the quotation ${quotation?.quotationNumber}.`,
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
            title: `Quotation ${quotation?.quotationNumber}`,
            text: `Here is the quotation ${quotation?.quotationNumber}.`,
            url: shareUrl
          });
        } else {
          toast("Native sharing not supported on this browser. Use Copy Link instead.", { icon: "ℹ️", duration: 4000 });
        }
      } catch (fallbackErr) {
        if (fallbackErr.name !== 'AbortError') {
          console.error("Fallback share error:", fallbackErr);
          toast.error("Could not share quotation.");
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
          <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-white border-b border-slate-200 relative z-10 print:hidden gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">Quotation Preview</h2>
                <p className="text-[10px] text-slate-500 font-medium">{enrichedQuotation?.quotationNumber} • Ready to share</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
              <div className="w-px h-5 bg-slate-200 mx-1.5 hidden sm:block" />
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
            <div className="print:m-0">
              <QuotationTemplate ref={quotationRef} quotation={enrichedQuotation} />
            </div>
          </div>
        </motion.div>
      </div>
      
    </AnimatePresence>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #quotation-printable, #quotation-printable * { visibility: visible; }
          #quotation-printable {
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

export default QuotationPreviewModal;
