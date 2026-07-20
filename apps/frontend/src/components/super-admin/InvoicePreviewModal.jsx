import React from "react";
import SubscriptionInvoiceTemplate from "./SubscriptionInvoiceTemplate";
import { FileText, Download, Share2 } from "lucide-react";

import toast from "react-hot-toast";

const InvoicePreviewModal = ({ invoice, tenant, onClose }) => {
  if (!invoice) return null;

  const handlePrintInvoice = () => {
    const printContent = document.getElementById("tenant-invoice-printable");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - DoCaterPro</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { padding: 20px; }
              #tenant-invoice-printable { border: none !important; box-shadow: none !important; }
            }
          </style>
        </head>
        <body class="bg-white">
          <div class="p-6">
            ${printContent.outerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("tenant-invoice-printable");
    if (!element) {
      toast.error("Invoice template not found in DOM");
      return;
    }

    toast.loading("Generating PDF...", { id: "pdf-toast" });

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      toast.success("PDF Downloaded successfully!", { id: "pdf-toast" });
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error(`Failed to download PDF: ${error.message || error}`, { id: "pdf-toast" });
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Dear ${tenant.name} Team,\n\nYour subscription invoice *${invoice.invoiceNumber}* for the period *${invoice.period}* is ready.\n\n*Total Amount:* ₹${invoice.amount.toLocaleString("en-IN")}\n*Due Date:* ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}\n*Status:* ${invoice.status.toUpperCase()}\n\nThank you for choosing DoCaterPro!`
    );
    const phone = tenant.contactPhone ? tenant.contactPhone.replace(/\D/g, '') : "";
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-[670px] w-full border border-slate-100 shadow-2xl p-5 relative animate-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Invoice Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintInvoice}
              className="bg-indigo-600 hover:bg-indigo-700 text-[#ffffff] px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-700 text-[#ffffff] px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="bg-green-600 hover:bg-green-700 text-[#ffffff] px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} /> Share via WhatsApp
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:bg-slate-50 p-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto p-1 bg-slate-50/50 rounded-2xl border border-slate-100/50">
          <SubscriptionInvoiceTemplate 
            invoice={invoice} 
            tenant={tenant} 
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
