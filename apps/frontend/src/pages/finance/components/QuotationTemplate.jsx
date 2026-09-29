import { CURRENCY } from "../../../config/currency";
import React from "react";
import { useTenantStore } from "../../../store/useTenantStore";

/**
 * Royal Green Luxury Quotation PDF Template
 * Features double-border royal green frame, proposal card, client & event cards,
 * categorized item blocks (Welcome Drinks, Main Course, Arrangements, etc.) matching reference designs.
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
        unit: "PAX",
        unitPrice: price,
        total: price * qty,
        isIncluded: false,
      }
    ];
  }, []);

  // Helper: build a line item from a menu entry
  const buildMenuLine = (menu) => {
    const sel = selections[menu.id] || {};
    const isPackageItem = Boolean(sel.packageId);
    const hasCustomQty = sel.quantity !== undefined && sel.quantity !== null && sel.quantity !== "";
    const type = sel.type || (isPackageItem ? "PACKAGE" : "PER_HEAD");
    const price = isPackageItem ? 0 : Number(sel.price) || 0;
    const qty = hasCustomQty 
      ? Number(sel.quantity) 
      : isPackageItem 
        ? null 
        : type === "PER_HEAD" 
          ? Number(guestCount) || 1 
          : Number(sel.quantity) || 1;
    const unit = sel.unit ? sel.unit.toUpperCase() : (type === "PER_HEAD" ? "PAX" : "NOS");
    const shortDesc = menu.description ? (menu.description.length > 100 ? menu.description.substring(0, 100) + "..." : menu.description) : null;
    return {
      description: menu.name,
      shortDesc,
      note: isPackageItem ? "Package item" : type === "PER_HEAD" ? `Per head × ${qty} guests` : `Fixed price`,
      qty,
      unit,
      unitPrice: price,
      total: price * (qty || 1),
      isIncluded: isPackageItem && !hasCustomQty,
    };
  };

  // Build categorised menu sections in required order
  const welcomeDrinkLines = menus.filter(m => m.category === "Beverages").map(buildMenuLine);
  const starterLines      = menus.filter(m => m.category === "Starters").map(buildMenuLine);
  const mainCourseLines   = menus.filter(m => m.category === "Main Course").map(buildMenuLine);
  const dessertLines      = menus.filter(m => m.category === "Desserts").map(buildMenuLine);
  
  // Group other custom categories dynamically
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
    unit: (a.unit || "NOS").toUpperCase(),
    unitPrice: Number(a.rentPerDay || 0),
    total: Number(a.quantity || 1) * Number(a.rentPerDay || 0) * Number(durationInDays || 1),
    isIncluded: false,
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
          unit: "STAFF",
          unitPrice: Number(cateringBoyRate || 0),
          total: cateringBoyCost,
          isIncluded: false,
        }]
      : []),
    ...staff.map((s) => ({
      description: `Staff: ${s.role || "Staff"}`,
      note: `${Number(s.count) || 0} staff × ${durationInDays} day(s)`,
      qty: Number(s.count) || 0,
      unit: "STAFF",
      unitPrice: Number(s.rate || 0),
      total: (Number(s.count) || 0) * Number(s.rate || 0) * Number(durationInDays || 1),
      isIncluded: false,
    })),
    ...extras.map((item) => ({
      description: item.description,
      note: null,
      qty: Number(item.quantity) || 1,
      unit: (item.unit || "NOS").toUpperCase(),
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
      isIncluded: false,
    })),
  ];

  // Final ordered sections matching reference
  const sections = [
    { label: "Welcome Drinks",  lines: welcomeDrinkLines },
    { label: "Starters",        lines: starterLines },
    { label: "Main Course",     lines: [...packageLines, ...mainCourseLines] },
    { label: "Arrangements",    lines: arrangementLines },
    { label: "Desserts",        lines: dessertLines },
    ...otherSections,
    { label: "Staffs",          lines: staffLines },
  ].filter(section => section.lines.length > 0);

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
    return "15 Days";
  };
  const validityText = getValidityText();

  // Logo source (fallback to /software_logo.PNG if no tenant logo)
  const logoSrc = tenant.logoUrl
    ? (tenant.logoUrl.startsWith('http') ? tenant.logoUrl : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${tenant.logoUrl}`)
    : "/software_logo.PNG";

  // Real or fallback event details
  const occasion = quotation.event?.title || 
    (quotation.package?.name ? `${quotation.package.name}` : (quotation.event ? "Event" : "Wedding"));

  const eventDate = quotation.event?.date || quotation.date || validUntil || createdAt || new Date();

  const timingSlot = quotation.event?.time ? (
    quotation.event.time.includes(":") ? `TIME ${quotation.event.time}` : quotation.event.time.toUpperCase()
  ) : "EVENING 5 PM";

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
            {/* Left: Branding & Contact Details */}
            <div className="flex items-start gap-4 flex-1 pr-4">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden pt-0.5">
                <img 
                  src={logoSrc} 
                  alt="Logo" 
                  className="max-h-16 max-w-16 object-contain"
                />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h2 className="font-serif text-2xl font-bold tracking-[0.2em] text-[#163A2B] uppercase leading-none">
                  {tenant.name || "SILVER CATERING"}
                </h2>
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#A37B3E] uppercase pt-0.5">
                  CATERING & EVENTS
                </p>
                <div className="text-[11px] text-slate-700 space-y-0.5 pt-1.5 leading-snug">
                  <p>
                    <span className="font-bold text-slate-900">Tel:</span> {tenant.contactPhone || "+91 98464 15767 | +91 75939 82800"}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900">Web:</span> {tenant.website || "www.silvercatering.in"}
                    <span className="mx-2 text-slate-400">•</span>
                    <span className="font-bold text-slate-900">Email:</span> {tenant.contactEmail || "Silvereventsandcaters@gmail.com"}
                  </p>
                  <p className="text-slate-600 whitespace-pre-line">
                    {tenant.pdfFromAddress || tenant.address || "Thalakuttiparambil house, Mecheriparambu, Irimbiliyam PO - 679572, Valanchery"}
                  </p>
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
                  <span className="font-black text-slate-900 font-mono tracking-tight text-[11px]">{quotationNumber || "QT-0009"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-[11px]">Date:</span>
                  <span className="font-bold text-slate-900 text-[11px]">{createdAt ? formatDate(createdAt) : formatDate(new Date())}</span>
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
                  <span className="font-black text-slate-900 uppercase tracking-wide text-xs truncate">{customer?.name || "SHAMEEM"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Contact No:</span>
                  <span className="font-bold text-slate-800 text-xs truncate">
                    {quotationPdfSettings.showCustomerContact !== false 
                      ? ([customer?.phone, customer?.email].filter(Boolean).join(" • ") || "9746476990") 
                      : "—"}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Venue / Place:</span>
                  <span className="font-semibold text-slate-800 text-xs leading-snug line-clamp-2">
                    {quotationPdfSettings.showCustomerAddress !== false ? (venuePlace || "—") : "—"}
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
                  <span className="font-bold text-slate-900 text-xs truncate">{occasion || "Wedding"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Event Date:</span>
                  <span className="font-bold text-slate-900 text-xs">{formatDate(eventDate)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Timing / Slot:</span>
                  <span className="font-bold text-slate-900 uppercase text-xs truncate">{timingSlot || "EVENING 5 PM"}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 my-1"></div>
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium w-28 shrink-0 text-[11px]">Guest Count:</span>
                  <span className="bg-[#163A2B] text-white px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase inline-block">
                    {guestCount || 70} GUESTS (PAX)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Sections matching reference media_1790706617324.png */}
          <div className="relative mb-6">
            {/* Subtle Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
              <img src="/software_logo.PNG" alt="" className="w-96 max-w-full object-contain" />
            </div>

            {sections.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm border border-[#D8D2C4] rounded-md bg-white">
                No items found
              </div>
            ) : (
              sections.map((section, sIdx) => {
                const sectionNum = String(sIdx + 1).padStart(2, '0');
                return (
                  <div
                    key={section.label}
                    className="border border-[#D8D2C4] rounded-md overflow-hidden bg-white shadow-2xs mb-4.5 last:mb-0 relative z-10"
                  >
                    {/* Royal Green Section Header with Bronze Number Badge */}
                    <div className="bg-[#163A2B] px-3.5 py-1.5 flex items-center gap-2.5 border-b-2 border-[#A37B3E]">
                      <span className="bg-[#7A5E2E] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-[3px] tracking-wider leading-none">
                        {sectionNum}
                      </span>
                      <h3 className="font-serif font-black text-xs tracking-[0.18em] text-white uppercase leading-none">
                        {section.label}
                      </h3>
                    </div>

                    {/* Section Items Table */}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F6F0] border-b border-[#E8E2D5] text-[#8B8374]">
                          <th className="py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider w-12 text-center">
                            #
                          </th>
                          <th className="py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider">
                            MENU / SERVICE INCLUSION
                          </th>
                          {quotationPdfSettings.showItemQuantity !== false && (
                            <th className="py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-right w-36">
                              QUANTITY & UNIT
                            </th>
                          )}
                          {quotationPdfSettings.showItemUnitPrice && (
                            <th className="py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-right w-28">
                              UNIT PRICE
                            </th>
                          )}
                          {quotationPdfSettings.showItemTotalPrice && (
                            <th className="py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider text-right w-28">
                              TOTAL
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0ECE1]">
                        {section.lines.map((line, lIdx) => {
                          const rowNum = String(lIdx + 1).padStart(2, '0');
                          const isIncluded = line.isIncluded || (!line.qty && Number(line.unitPrice || 0) === 0);
                          return (
                            <tr key={lIdx} className="hover:bg-[#FAF9F5] transition-colors">
                              <td className="py-2 px-3 text-center text-xs font-bold text-[#8B8374] font-mono">
                                {rowNum}
                              </td>
                              <td className="py-2 px-3">
                                <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                                  {line.description}
                                </span>
                                {line.shortDesc && (
                                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                                    {line.shortDesc}
                                  </p>
                                )}
                              </td>
                              {quotationPdfSettings.showItemQuantity !== false && (
                                <td className="py-2 px-3 text-right">
                                  {isIncluded ? (
                                    <span className="text-[11px] font-black tracking-wider text-[#A37B3E] uppercase">
                                      INCLUDED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] border border-[#DCD6C8] text-xs font-bold text-slate-800">
                                      {line.qty}{" "}
                                      {line.unit ? (
                                        <span className="text-[10px] text-slate-600 ml-1 font-bold uppercase">
                                          {line.unit}
                                        </span>
                                      ) : null}
                                    </span>
                                  )}
                                </td>
                              )}
                              {quotationPdfSettings.showItemUnitPrice && (
                                <td className="py-2 px-3 text-right text-xs font-medium text-slate-700">
                                  {line.unitPrice ? `${CURRENCY}${fmt(line.unitPrice)}` : "—"}
                                </td>
                              )}
                              {quotationPdfSettings.showItemTotalPrice && (
                                <td className="py-2 px-3 text-right text-xs font-bold text-slate-900">
                                  {line.total ? `${CURRENCY}${fmt(line.total)}` : "—"}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>

          {/* Totals Section (Luxury Royal Green & Gold Estimate Card) */}
          <div className="flex justify-between items-end gap-6 mb-8 pt-2">
            {/* Left helper note / validity notice */}
            <div className="flex-1 max-w-[360px] pb-1">
              <div className="border border-[#E2DDD3] rounded-lg p-3 bg-[#FAF8F5] text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-[#163A2B] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A37B3E]"></span>
                  Pricing & Quotation Notice
                </p>
                <p className="text-[10.5px] leading-relaxed text-slate-500">
                  This proposal is calculated for <strong className="text-slate-700 font-semibold">{guestCount || 0} Guests</strong>. Total price is an estimate and subject to final menu confirmation and headcount adjustments.
                </p>
              </div>
            </div>

            {/* Right: Luxury Estimate Summary Card */}
            <div className="w-[330px] border border-[#D8D2C4] rounded-lg overflow-hidden bg-white shadow-2xs">
              <div className="bg-[#F4F1EA] px-3.5 py-1.5 border-b border-[#D8D2C4] flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#163A2B] uppercase">ESTIMATE SUMMARY</span>
                <span className="text-[9px] font-bold text-[#A37B3E] uppercase tracking-wider">ALL AMOUNTS IN {CURRENCY}</span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium text-[11px]">Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono text-[11.5px]">{CURRENCY}{fmt(subtotal)}</span>
                </div>
                {quotationPdfSettings.showTax !== false && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium text-[11px]">Estimated Tax</span>
                    <span className="font-semibold text-slate-800 font-mono text-[11.5px]">{CURRENCY}{fmt(tax)}</span>
                  </div>
                )}
                {quotationPdfSettings.showDiscount !== false && Number(discountAmount) > 0 && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="font-medium text-[11px]">Discount Applied</span>
                    <span className="font-bold font-mono text-[11.5px]">-{CURRENCY}{fmt(discountAmount)}</span>
                  </div>
                )}
              </div>
              {/* Grand Total Bar */}
              <div className="bg-[#163A2B] px-3.5 py-2.5 flex justify-between items-center border-t-2 border-[#A37B3E]">
                <div>
                  <span className="text-[8.5px] font-bold text-[#D4AF37] uppercase tracking-[0.16em] block">NET ESTIMATE</span>
                  <span className="text-xs font-serif font-black tracking-widest text-white uppercase block">TOTAL AMOUNT</span>
                </div>
                <span className="text-lg font-black text-white font-mono tracking-tight">
                  {CURRENCY}{fmt(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer (Terms, Signatures & Bottom Branding) matching reference */}
          <div className="border-t border-[#E8E2D5] pt-5 mt-6">
            <div className="flex justify-between items-start gap-8">
              {/* Left: STANDARD CATERING TERMS */}
              <div className="flex-1 max-w-[420px]">
                <h4 className="text-[11px] font-serif font-bold tracking-[0.14em] text-[#163A2B] uppercase">
                  STANDARD CATERING TERMS
                </h4>
                <div className="border-b border-[#E8E2D5] my-1.5 w-full"></div>
                <div className="text-[9.5px] leading-relaxed text-slate-600 space-y-1">
                  <p>1. Advance payment of 50% is required to confirm the date and kitchen booking.</p>
                  <p>2. Final guest headcount, menu adjustments & balance payment must be settled on or before event day.</p>
                  <p>3. All food preparations and arrangements are maintained under strict gourmet hygiene standards.</p>
                  <p>4. Chaffing dishes, cutlery, and presentation materials remain the property of Silver Catering.</p>
                  {notes && (
                    <p className="pt-1 text-slate-700 italic border-t border-[#F0ECE1] mt-1">
                      <strong className="not-italic text-[#163A2B]">Additional Notes: </strong>{notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Dual Signatures (CLIENT ACCEPTANCE & FOR SILVER CATERING) */}
              <div className="flex items-end gap-6 pt-5 shrink-0">
                {/* Client Signature */}
                <div className="text-center w-36 sm:w-40">
                  <div className="border-b border-slate-900 w-full mb-1.5"></div>
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                    CLIENT ACCEPTANCE
                  </p>
                  <p className="text-[9px] text-slate-500 italic mt-0.5">
                    Sign & Date
                  </p>
                </div>

                {/* Company Signature */}
                <div className="text-center w-36 sm:w-40">
                  <div className="border-b border-slate-900 w-full mb-1.5"></div>
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider truncate">
                    FOR {tenant.name ? tenant.name.toUpperCase() : "SILVER CATERING"}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Authorized Signatory
                  </p>
                </div>
              </div>
            </div>

            {/* Dotted Divider */}
            <div className="border-t border-dotted border-[#D8D2C4] my-3.5"></div>

            {/* Bottom Centered Thank You Message & Contact */}
            <div className="text-center space-y-0.5 text-slate-600">
              <p className="text-[10.5px]">
                Thank you for trusting <strong className="font-bold text-slate-900">{tenant.name || "SILVER CATERING"}</strong> — Making your celebrations memorable & flavorful.
              </p>
              <p className="text-[9px] text-slate-400 tracking-wide">
                {tenant.website || "www.silvercatering.in"} • Contact: {tenant.contactPhone || "+91 98464 15767"} • Computer Generated Quotation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

QuotationTemplate.displayName = "QuotationTemplate";

export default QuotationTemplate;
