

import { useTenantStore } from "../../../store/useTenantStore";

export const generateIngredientPdf = async (event, ingredients) => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDF();
  const tenant = useTenantStore.getState().tenant;
  
  const textColor = [50, 50, 50];
  const headingColor = [0, 0, 0];
  const lightColor = [120, 120, 120];

  // Header
  doc.setFontSize(18);
  doc.setTextColor(...headingColor);
  doc.setFont("helvetica", "bold");
  doc.text("INGREDIENT PLANNING LIST", 14, 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...lightColor);
  doc.text(`Event: ${event?.title || "Untitled Event"}`, 14, 28);
  doc.text(`Date: ${event?.date ? new Date(event.date).toLocaleDateString() : "N/A"}`, 14, 33);
  doc.text(`Guest Count: ${event?.guestCount || 0} People`, 14, 38);

  let currentLeftY = 38;
  let currentRightY = 22;

  // From Address (Right Aligned)
  if (tenant) {
    doc.setFontSize(11);
    doc.setTextColor(...headingColor);
    doc.setFont("helvetica", "bold");
    doc.text(tenant.name || "Catering Company", 196, 22, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...lightColor);
    
    currentRightY = 28;
    if (tenant.pdfFromAddress) {
      const lines = doc.splitTextToSize(tenant.pdfFromAddress, 70);
      doc.text(lines, 196, currentRightY, { align: "right" });
      currentRightY += (lines.length * 4);
    } else {
      if (tenant.address) { doc.text(tenant.address, 196, currentRightY, { align: "right" }); currentRightY += 5; }
      if (tenant.contactPhone) { doc.text(tenant.contactPhone, 196, currentRightY, { align: "right" }); }
    }
  }

  const dividerY = Math.max(currentLeftY, currentRightY) + 4;

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(14, dividerY, 196, dividerY);

  // Group ingredients by Menu Item
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const groupName = ing.menu ? ing.menu.name : "Custom / General Items";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(ing);
    return acc;
  }, {});

  let startY = dividerY + 6;

  Object.entries(groupedIngredients).forEach(([groupName, items]) => {
    const tableData = items.map((ing, index) => [
      index + 1,
      ing.inventory ? ing.inventory.name : ing.customName,
      ing.category || "Other",
      `${ing.quantity} ${ing.unit}`,
      ing.isPurchased ? "Purchased" : "Pending"
    ]);

    doc.autoTable({
      startY: startY,
      head: [[groupName, "Category", "Quantity", "Status"]],
      body: tableData.map(row => [row[1], row[2], row[3], row[4]]), // Exclude index to save space, put group name in header
      theme: "plain",
      headStyles: {
        fillColor: [250, 250, 250],
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
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 }
      },
      didDrawPage: (data) => {
        if (data.cursor.y > 270) {
          // Pagination happens naturally
        }
      }
    });

    startY = doc.lastAutoTable.finalY + 10;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...lightColor);
    doc.text(
      `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Download the PDF
  const filename = `${event?.title?.replace(/\s+/g, '_').toLowerCase() || 'event'}_ingredients.pdf`;
  doc.save(filename);
};
