

import { useTenantStore } from "../../../store/useTenantStore";

export const generateInvoicePdf = async (invoice) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const tenant = useTenantStore.getState().tenant;
  const pdfSettings = tenant?.pdfSettings || {
    showCustomerContact: true,
    showCustomerAddress: true,
    showEventDetails: true,
    showTax: true,
    showDiscount: true
  };
  
  // Clean minimal theme variables
  const textColor = [50, 50, 50];
  const headingColor = [0, 0, 0];
  const lightColor = [120, 120, 120];

  // Header
  doc.setFontSize(20);
  doc.setTextColor(...headingColor);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 14, 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...lightColor);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 28);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, 33);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 38);

  // From Address (Right Aligned)
  if (tenant) {
    doc.setFontSize(11);
    doc.setTextColor(...headingColor);
    doc.setFont("helvetica", "bold");
    doc.text(tenant.name || "Catering Company", 196, 22, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...lightColor);
    
    if (tenant.pdfFromAddress) {
      const lines = doc.splitTextToSize(tenant.pdfFromAddress, 70);
      doc.text(lines, 196, 28, { align: "right" });
    } else {
      let currentY = 28;
      if (tenant.address) { doc.text(tenant.address, 196, currentY, { align: "right" }); currentY += 5; }
      if (tenant.contactEmail) { doc.text(tenant.contactEmail, 196, currentY, { align: "right" }); currentY += 5; }
      if (tenant.contactPhone) { doc.text(tenant.contactPhone, 196, currentY, { align: "right" }); }
    }
    
    if (tenant.taxNumber) {
      doc.setFontSize(8);
      doc.setTextColor(...lightColor);
      const taxText = `Tax No: ${tenant.taxNumber}${tenant.taxDetails ? ` | ${tenant.taxDetails}` : ''}`;
      doc.text(taxText, 196, 42, { align: "right" });
    }
  }

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(14, 45, 196, 45);

  // Billed To Section
  let billToY = 55;
  doc.setFontSize(10);
  doc.setTextColor(...headingColor);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, billToY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  let currentY = billToY + 6;
  doc.text(invoice.customer?.name || "Customer", 14, currentY);
  
  if (pdfSettings.showCustomerContact && invoice.customer?.phone) {
    currentY += 5;
    doc.text(invoice.customer.phone, 14, currentY);
  }
  if (pdfSettings.showCustomerContact && invoice.customer?.email) {
    currentY += 5;
    doc.text(invoice.customer.email, 14, currentY);
  }
  if (pdfSettings.showCustomerAddress && invoice.customer?.address) {
    currentY += 5;
    const custLines = doc.splitTextToSize(invoice.customer.address, 70);
    doc.text(custLines, 14, currentY);
    currentY += (custLines.length * 4);
  }

  let eventY = 55;
  if (pdfSettings.showEventDetails) {
    doc.setFontSize(10);
    doc.setTextColor(...headingColor);
    doc.setFont("helvetica", "bold");
    doc.text("Event Details:", 120, eventY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text(`${invoice.event?.title || 'Event'}`, 120, eventY + 6);
    doc.text(`${new Date(invoice.event?.date || new Date()).toLocaleDateString()}`, 120, eventY + 11);
  }

  // Set startY for table based on which section is longer (add some padding)
  let tableStartY = Math.max(currentY, pdfSettings.showEventDetails ? eventY + 11 : billToY + 6) + 12;

  // Items Table
  if (invoice.items && invoice.items.length > 0) {
    const headers = ["#", "Description"];
    if (pdfSettings.showItemQuantity !== false) headers.push("Qty");
    if (pdfSettings.showItemUnitPrice !== false) headers.push("Unit Price");
    if (pdfSettings.showItemTotalPrice !== false) headers.push("Total");

    const itemsByCategory = {};
    const menuItems = invoice.event?.menuItems || [];

    invoice.items.forEach(item => {
      let category = "Other Services";
      const match = menuItems.find(m => item.description.includes(m.name));
      if (match && match.category) {
        category = match.category;
      }
      
      if (!itemsByCategory[category]) itemsByCategory[category] = [];
      itemsByCategory[category].push(item);
    });

    const tableData = [];
    let itemIndex = 1;

    const categories = Object.keys(itemsByCategory).sort((a, b) => {
      if (a === "Other Services") return 1;
      if (b === "Other Services") return -1;
      return a.localeCompare(b);
    });

    categories.forEach(category => {
      // Add Category Header Row
      tableData.push([
        { content: category, colSpan: headers.length, styles: { fillColor: [247, 247, 247], fontStyle: "bold", textColor: headingColor } }
      ]);
      
      itemsByCategory[category].forEach(item => {
        const row = [itemIndex++, item.description];
        if (pdfSettings.showItemQuantity !== false) row.push(item.quantity);
        if (pdfSettings.showItemUnitPrice !== false) row.push(Number(item.unitPrice).toFixed(2));
        if (pdfSettings.showItemTotalPrice !== false) row.push(Number(item.total).toFixed(2));
        tableData.push(row);
      });
    });

    const colStyles = {
      0: { cellWidth: 10 },
      1: { cellWidth: "auto" }
    };
    
    let colIndex = 2;
    if (pdfSettings.showItemQuantity !== false) {
      colStyles[colIndex++] = { cellWidth: 15, halign: "center" };
    }
    if (pdfSettings.showItemUnitPrice !== false) {
      colStyles[colIndex++] = { cellWidth: 30, halign: "right" };
    }
    if (pdfSettings.showItemTotalPrice !== false) {
      colStyles[colIndex++] = { cellWidth: 30, halign: "right" };
    }

    autoTable(doc, {
      startY: tableStartY,
      head: [headers],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: headingColor,
        fontStyle: "bold",
        lineWidth: { bottom: 0.5 },
        lineColor: [200, 200, 200]
      },
      bodyStyles: {
        textColor: textColor,
        lineWidth: { bottom: 0.1 },
        lineColor: [240, 240, 240]
      },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: colStyles
    });
    tableStartY = doc.lastAutoTable.finalY + 10;
  }

  // Summary
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  const summaryX = 140;
  
  doc.text("Subtotal:", summaryX, tableStartY);
  doc.text(Number(invoice.subtotal).toFixed(2), 196, tableStartY, { align: "right" });
  
  if (pdfSettings.showTax) {
    tableStartY += 6;
    doc.text(`Tax (${Number(invoice.taxRate || 0)}%):`, summaryX, tableStartY);
    doc.text(Number(invoice.tax || 0).toFixed(2), 196, tableStartY, { align: "right" });
  }

  if (pdfSettings.showDiscount && Number(invoice.discountAmount) > 0) {
    tableStartY += 6;
    doc.text("Discount:", summaryX, tableStartY);
    doc.text(`-${Number(invoice.discountAmount || 0).toFixed(2)}`, 196, tableStartY, { align: "right" });
  }

  tableStartY += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, tableStartY, 196, tableStartY);
  
  tableStartY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...headingColor);
  doc.text("Total Amount:", summaryX, tableStartY);
  doc.text(Number(invoice.totalAmount).toFixed(2), 196, tableStartY, { align: "right" });

  tableStartY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.text("Paid Amount:", summaryX, tableStartY);
  doc.text(Number(invoice.advancePaid).toFixed(2), 196, tableStartY, { align: "right" });

  tableStartY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...headingColor);
  doc.text("Balance Due:", summaryX, tableStartY);
  doc.text(Number(invoice.balanceAmount).toFixed(2), 196, tableStartY, { align: "right" });

  // Download the PDF
  const filename = `${invoice.invoiceNumber || 'Invoice'}.pdf`;
  doc.save(filename);
};
