import { CURRENCY } from "../../../config/currency";
import React from "react";
import { useTenantStore } from "../../../store/useTenantStore";

/**
 * Clean Quotation PDF Template
 * Renders actual saved data: menus, inventory, catering staff, custom items.
 */
const QuotationTemplate = React.forwardRef(({ quotation }, ref) => {
  const tenant = useTenantStore((state) => state.tenant) || {};
  if (!quotation) return null;

  const quotationPdfSettings = tenant.quotationPdfSettings || {
    showCustomerContact: true,
    showCustomerAddress: true,
    showEventDetails: true,
    showTax: true,
    showDiscount: true,
    showItemQuantity: true,
    showItemUnitPrice: false,
    showItemTotalPrice: false
  };

  const {
    quotationNumber,
    customer,
    subtotal,
    tax,
    totalAmount,
    discountAmount,
    status,
    validUntil,
    createdAt,
    guestCount,
    durationInDays,
    cateringBoysCount,
    cateringBoyRate,
    notes,
    menuItems,
    customMenuSelections,
    inventoryAllocations,
    staffAllocations,
    customItems,
  } = quotation;

  // Parse JSON fields safely
  const parseJson = (val, fallback) => {
    if (!val) return fallback;
    if (typeof val !== "string") return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const selections = parseJson(customMenuSelections, {});
  const allocations = parseJson(inventoryAllocations, []);
  const staff = parseJson(staffAllocations, []);
  const extras = parseJson(customItems, []);
  const menus = Array.isArray(menuItems) ? menuItems : [];

  const packageLines = Object.values(selections).reduce((lines, sel) => {
    if (!sel?.packageId || lines.some(line => line.packageId === sel.packageId)) return lines;
    const qty = (Number(guestCount) || 1) * (Number(durationInDays) || 1);
    const price = Number(sel.packagePricePerHead) || 0;
    return [
      ...lines,
      {
        packageId: sel.packageId,
        description: sel.packageName || "Package",
        note: `Package x ${qty} pax`,
        qty,
        unitPrice: price,
        total: price * qty,
      }
    ];
  }, []);

  // Helper: build a line item from a menu entry
  const buildMenuLine = (menu) => {
    const sel = selections[menu.id] || {};
    const isPackageItem = Boolean(sel.packageId);
    const type = sel.type || "PER_HEAD";
    const price = isPackageItem ? 0 : Number(sel.price) || 0;
    const qty = isPackageItem ? 1 : type === "PER_HEAD" ? Number(guestCount) || 1 : Number(sel.quantity) || 1;
    const unit = isPackageItem ? "" : type === "PER_HEAD" ? "pax" : (sel.unit || "pcs");
    const shortDesc = menu.description ? (menu.description.length > 100 ? menu.description.substring(0, 100) + "..." : menu.description) : null;
    return {
      description: menu.name,
      shortDesc,
      note: isPackageItem ? "Package item" : type === "PER_HEAD" ? `Per head × ${qty} guests` : `Fixed price`,
      qty,
      unit,
      unitPrice: price,
      total: price * qty,
    };
  };

  // Category order for menu items in the PDF
  const CATEGORY_ORDER = [
    "Beverages",   // Welcome Drinks
    "Starters",
    "Main Course",
    // Arrangements (inventory) inserted between Main Course and Desserts
    "Desserts",
    "Snacks",
  ];

  // Build categorised menu sections in the required order
  const welcomeDrinkLines  = menus.filter(m => m.category === "Beverages").map(buildMenuLine);
  const starterLines       = menus.filter(m => m.category === "Starters").map(buildMenuLine);
  const mainCourseLines    = menus.filter(m => m.category === "Main Course").map(buildMenuLine);
  const dessertLines       = menus.filter(m => m.category === "Desserts").map(buildMenuLine);
  
  // Group any other custom categories (like Snacks, Pickles, etc.) dynamically
  const explicitCategories = ["Beverages", "Starters", "Main Course", "Desserts"];
  const otherMenus = menus.filter(m => !explicitCategories.includes(m.category));
  
  const otherSectionsMap = {};
  otherMenus.forEach(m => {
    const cat = m.category || "Other Items";
    if (!otherSectionsMap[cat]) otherSectionsMap[cat] = [];
    otherSectionsMap[cat].push(buildMenuLine(m));
  });

  const otherSections = Object.keys(otherSectionsMap).map(cat => ({
    label: cat,
    lines: otherSectionsMap[cat]
  }));

  const arrangementLines = allocations.map((a) => ({
    description: a.name,
    note: `${a.quantity} ${a.unit} × ${durationInDays} day(s)`,
    qty: Number(a.quantity) || 1,
    unit: a.unit || "unit",
    unitPrice: Number(a.rentPerDay || 0),
    total: Number(a.quantity || 1) * Number(a.rentPerDay || 0) * Number(durationInDays || 1),
  }));

  const cateringBoyCost =
    Number(cateringBoysCount) > 0
      ? Number(cateringBoysCount) * Number(cateringBoyRate || 0) * Number(durationInDays || 1)
      : 0;

  const staffLines = [
    ...(cateringBoyCost > 0
      ? [{
          description: "Catering Staff (Legacy)",
          note: `${cateringBoysCount} staff × ${durationInDays} day(s)`,
          qty: Number(cateringBoysCount),
          unitPrice: Number(cateringBoyRate || 0),
          total: cateringBoyCost,
        }]
      : []),
    ...staff.map((s) => ({
      description: `Staff: ${s.role || "Unknown"}`,
      note: `${Number(s.count) || 0} staff × ${durationInDays} day(s)`,
      qty: Number(s.count) || 0,
      unit: "staff",
      unitPrice: Number(s.rate || 0),
      total: (Number(s.count) || 0) * Number(s.rate || 0) * Number(durationInDays || 1),
    })),
    ...extras.map((item) => ({
      description: item.description,
      note: null,
      qty: Number(item.quantity) || 1,
      unit: item.unit || "pcs",
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
    })),
  ];

  // Final ordered sections for rendering
  const sections = [
    { label: "Welcome Drinks",  lines: welcomeDrinkLines },
    { label: "Starters",        lines: starterLines },
    { label: "Main Course",     lines: [...packageLines, ...mainCourseLines] },
    { label: "Arrangements",    lines: arrangementLines },
    { label: "Desserts",        lines: dessertLines },
    ...otherSections,
    { label: "Staffs",          lines: staffLines },
  ].filter(section => section.lines.length > 0);

  // Flat list still needed for numbering (sequential across all sections)
  const allLines = sections.flatMap(s => s.lines);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Format date as d.m.yyyy (matching reference e.g. 2.10.2026)
  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  // Calculate real validity period
  const getValidityText = () => {
    if (validUntil && createdAt) {
      const diff = Math.round((new Date(validUntil).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) return `${diff} Days`;
    }
    if (validUntil) return formatDate(validUntil);
    return "—";
  };
  const validityText = getValidityText();

  // Real Event Details from Software
  const occasion = quotation.event?.title || 
    (quotation.package?.name ? `${quotation.package.name}` : (quotation.event ? "Event" : "—"));

  const eventDate = quotation.event?.date || quotation.date || validUntil || createdAt;

  const timingSlot = quotation.event?.time ? (
    quotation.event.time.includes(":") ? `TIME ${quotation.event.time}` : quotation.event.time.toUpperCase()
  ) : "—";

  const venuePlace = quotation.event?.location || customer?.address || "—";

  return (
    <div
      ref={ref}
      id="quotation-printable"
      className="bg-white p-3 max-w-[850px] mx-auto text-slate-800 font-sans print:max-w-none print:w-full print:mx-0 print:p-0"
    >
      {/* Royal Green Double Border Frame matching reference */}
      <div className="border-[2.5px] border-[#163A2B] p-1 bg-white">
        <div className="border border-[#163A2B] p-6 sm:p-7 bg-white">
          {/* Top Header Section */}
          <div className="flex justify-between items-start gap-4 mb-3">
            {/* Left: Branding & Contact Details (100% Real Tenant Data) */}
            <div className="flex items-start gap-4 flex-1 pr-4">
              {tenant.logoUrl && (
                <div className="w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden pt-0.5">
                  <img 
                    src={tenant.logoUrl.startsWith('http') ? tenant.logoUrl : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${tenant.logoUrl}`} 
                    alt="Logo" 
                    className="max-h-16 max-w-16 object-contain"
                  />
                </div>
              )}
              <div className="space-y-0.5 flex-1 min-w-0">
                <h2 className="font-serif text-2xl font-bold tracking-[0.2em] text-[#163A2B] uppercase leading-none">
                  {tenant.name || "CATERING & EVENTS"}
                </h2>
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#A37B3E] uppercase pt-0.5">
                  CATERING & EVENTS
                </p>
                <div className="text-[11px] text-slate-700 space-y-0.5 pt-1.5 leading-snug">
                  {tenant.contactPhone && (
                    <p>
                      <span className="font-bold text-slate-900">Tel:</span> {tenant.contactPhone}
                    </p>
                  )}
                  {(tenant.website || tenant.contactEmail) && (
                    <p>
                      {tenant.website && (
                        <>
                          <span className="font-bold text-slate-900">Web:</span> {tenant.website}
                        </>
                      )}
                      {tenant.website && tenant.contactEmail && (
                        <span className="mx-2 text-slate-400">•</span>
                      )}
                      {tenant.contactEmail && (
                        <>
                          <span className="font-bold text-slate-900">Email:</span> {tenant.contactEmail}
                        </>
                      )}
                    </p>
                  )}
                  {(tenant.pdfFromAddress || tenant.address) && (
                    <p className="text-slate-600 whitespace-pre-line">
                      {tenant.pdfFromAddress || tenant.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quotation Proposal Card matching reference */}
            <div className="border border-[#c5aa78] rounded-lg bg-white p-3 min-w-[210px] shrink-0 shadow-2xs">
              <h3 className="text-center font-serif font-black text-base tracking-[0.18em] text-[#163A2B] uppercase leading-tight">
                QUOTATION
              </h3>
              <p className="text-center text-[8.5px] font-bold tracking-[0.16em] text-[#A37B3E] uppercase mt-0.5">
                EVENT PACKAGE PROPOSAL
              </p>
              <div className="border-b border-[#e5d8c3] my-2"></div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-[11px]">Quote Ref:</span>
                  <span className="font-black text-slate-900 font-mono tracking-tight text-[11px]">{quotationNumber || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-[11px]">Date:</span>
                  <span className="font-bold text-slate-900 text-[11px]">{createdAt ? formatDate(createdAt) : "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-[11px]">Validity:</span>
                  <span className="px-2 py-0.5 bg-[#f2ece2] text-[#8a6833] rounded text-[10px] font-bold leading-none">{validityText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dividing Bar */}
          <div className="border-b-2 border-[#163A2B] my-4"></div>

          {/* Specification Boxes Side-by-Side matching reference */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* CLIENT INFORMATION */}
            <div className="border border-[#d8d3c5] rounded-lg overflow-hidden bg-white shadow-2xs">
              <div className="bg-[#f4f2ec] px-3.5 py-1.5 border-b border-[#d8d3c5]">
                <h4 className="text-[10px] font-bold tracking-[0.15em] text-[#163A2B] uppercase">CLIENT INFORMATION</h4>
              </div>
              <div className="p-3 space-y-1.5 text-xs">
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Client Name:</span>
                  <span className="font-black text-slate-900 uppercase tracking-wide text-xs truncate">{customer?.name || "—"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Contact No:</span>
                  <span className="font-bold text-slate-800 text-xs truncate">
                    {quotationPdfSettings.showCustomerContact !== false 
                      ? ([customer?.phone, customer?.email].filter(Boolean).join(" • ") || "—") 
                      : "—"}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Venue / Place:</span>
                  <span className="font-semibold text-slate-800 text-xs leading-snug line-clamp-2">
                    {quotationPdfSettings.showCustomerAddress !== false ? venuePlace : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* EVENT SPECIFICATIONS */}
            <div className="border border-[#d8d3c5] rounded-lg overflow-hidden bg-white shadow-2xs">
              <div className="bg-[#f4f2ec] px-3.5 py-1.5 border-b border-[#d8d3c5]">
                <h4 className="text-[10px] font-bold tracking-[0.15em] text-[#163A2B] uppercase">EVENT SPECIFICATIONS</h4>
              </div>
              <div className="p-3 space-y-1.5 text-xs">
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Occasion:</span>
                  <span className="font-bold text-slate-900 text-xs truncate">{occasion}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Event Date:</span>
                  <span className="font-bold text-slate-900 text-xs">{formatDate(eventDate)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Timing / Slot:</span>
                  <span className="font-bold text-slate-900 uppercase text-xs truncate">{timingSlot}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 my-1"></div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Guest Count:</span>
                  <span className="bg-[#163A2B] text-white px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase inline-block">
                    {guestCount || 0} GUESTS (PAX)
                  </span>
                </div>
              </div>
            </div>
          </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 text-slate-900">
              <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider w-12 text-center">#</th>
              <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider">Description</th>
              {quotationPdfSettings.showItemQuantity !== false && (
                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-24">Qty</th>
              )}
              {quotationPdfSettings.showItemUnitPrice && (
                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-32">Unit Price</th>
              )}
              {quotationPdfSettings.showItemTotalPrice && (
                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-32">Total</th>
              )}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let colSpanCount = 2;
              if (quotationPdfSettings.showItemQuantity !== false) colSpanCount++;
              if (quotationPdfSettings.showItemUnitPrice) colSpanCount++;
              if (quotationPdfSettings.showItemTotalPrice) colSpanCount++;

              if (allLines.length === 0) {
                return (
                  <tr>
                    <td colSpan={colSpanCount} className="py-8 text-center text-slate-400 text-sm">No items found</td>
                  </tr>
                );
              }

              let counter = 0;
              return sections.map((section) => (
                <React.Fragment key={section.label}>
                  {/* Section header row */}
                  <tr>
                    <td colSpan={colSpanCount} className="py-2 px-2 bg-slate-100 border-t border-b border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {section.label}
                      </span>
                    </td>
                  </tr>
                  {/* Section line items */}
                  {section.lines.map((line) => {
                    counter += 1;
                    const rowNum = counter;
                    return (
                      <tr key={rowNum} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 text-center text-sm text-slate-500">{rowNum}</td>
                        <td className="py-3 px-2">
                          <p className="text-sm font-medium text-slate-800">{line.description}</p>
                          {line.shortDesc && <p className="text-[10px] text-slate-400 mt-0.5">{line.shortDesc}</p>}
                          {line.note && <p className="text-xs text-slate-500 mt-1">{line.note}</p>}
                        </td>
                        {quotationPdfSettings.showItemQuantity !== false && (
                          <td className="py-3 px-2 text-right text-sm font-semibold text-slate-700">
                            {line.qty}{line.unit ? <span className="text-xs font-normal text-slate-400 ml-1">{line.unit}</span> : null}
                          </td>
                        )}
                        {quotationPdfSettings.showItemUnitPrice && (
                          <td className="py-3 px-2 text-right text-sm font-medium text-slate-700">
                            {line.unitPrice ? `${CURRENCY}${fmt(line.unitPrice)}` : "—"}
                          </td>
                        )}
                        {quotationPdfSettings.showItemTotalPrice && (
                          <td className="py-3 px-2 text-right text-sm font-bold text-slate-900">
                            {line.total ? `${CURRENCY}${fmt(line.total)}` : "—"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-[320px]">
          <div className="space-y-2 px-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{CURRENCY}{fmt(subtotal)}</span>
            </div>
            {quotationPdfSettings.showTax !== false && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-medium text-slate-900">{CURRENCY}{fmt(tax)}</span>
              </div>
            )}
            {quotationPdfSettings.showDiscount !== false && Number(discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">-{CURRENCY}{fmt(discountAmount)}</span>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-200 my-3"></div>
          
          <div className="flex justify-between items-center px-2 mb-4">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total Estimate</span>
            <span className="text-xl font-bold text-slate-900">{CURRENCY}{fmt(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer (Terms & Signatory) */}
      <div className="border-t border-slate-200 pt-8 mt-8">
        <div className="grid grid-cols-2 gap-12">
          <div>
            {notes && (
              <>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Terms & Notes</h4>
                <div className="text-xs text-slate-500 leading-relaxed space-y-1">
                  <p>{notes}</p>
                </div>
              </>
            )}
          </div>
          <div className="text-right flex flex-col justify-end items-end">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Authorized Signatory</p>
            <div className="border-b border-slate-400 w-48 mt-8"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-[10px] text-slate-400">
        This is an estimate and not a final invoice. Prices may vary.
      </div>
        </div>
      </div>
    </div>
  );
});

QuotationTemplate.displayName = "QuotationTemplate";

export default QuotationTemplate;
