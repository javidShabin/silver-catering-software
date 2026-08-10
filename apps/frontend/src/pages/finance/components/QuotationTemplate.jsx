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

  return (
    <div
      ref={ref}
      id="quotation-printable"
      className="bg-white p-10 max-w-[800px] mx-auto text-slate-800 font-sans print:max-w-none print:w-full print:mx-0 print:p-8"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          {tenant.logoUrl && (
            <div className="mb-3">
              <img 
                src={tenant.logoUrl.startsWith('http') ? tenant.logoUrl : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${tenant.logoUrl}`} 
                alt="Logo" 
                className="max-h-24 object-contain"
              />
            </div>
          )}
          <h2 className={tenant.logoUrl ? "text-sm font-bold text-slate-900 uppercase tracking-wide" : "text-2xl font-bold text-slate-900 uppercase tracking-wide"}>
            {tenant.name || "Your Company"}
          </h2>
          <div className="text-sm text-slate-500 mt-2 space-y-1 whitespace-pre-wrap leading-relaxed">
            {tenant.pdfFromAddress || (
              <>
                {tenant.address && <p>{tenant.address}</p>}
                {tenant.contactEmail && <p>{tenant.contactEmail}</p>}
                {tenant.contactPhone && <p>{tenant.contactPhone}</p>}
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-4">Quotation</h1>
          <div className="text-sm space-y-1">
            <p className="text-slate-500"><span className="font-semibold text-slate-700">Date:</span> {createdAt ? new Date(createdAt).toLocaleDateString("en-IN") : "—"}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 my-8"></div>

      {/* Bill To & Details */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Prepared For</h4>
          <div className="text-sm space-y-1 text-slate-700">
            <p className="font-semibold text-slate-900">{customer?.name || "—"}</p>
            {customer?.email && <p>{customer.email}</p>}
            {customer?.phone && <p>{customer.phone}</p>}
            {customer?.address && <p className="max-w-[250px] whitespace-pre-wrap leading-relaxed">{customer.address}</p>}
          </div>
        </div>
        
        <div className="text-right">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Event Details</h4>
          <div className="text-sm space-y-1 text-slate-700">
            <p>Guests: <span className="font-semibold text-slate-900">{guestCount}</span></p>
            <p>Duration: <span className="font-semibold text-slate-900">{durationInDays} day(s)</span></p>
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
              <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-24">Qty</th>
            </tr>
          </thead>
          <tbody>
            {allLines.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400 text-sm">No items found</td>
              </tr>
            ) : (() => {
              let counter = 0;
              return sections.map((section) => (
                <React.Fragment key={section.label}>
                  {/* Section header row */}
                  <tr>
                    <td colSpan={3} className="py-2 px-2 bg-slate-100 border-t border-b border-slate-200">
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
                        <td className="py-3 px-2 text-right text-sm font-semibold text-slate-700">
                          {line.qty}{line.unit ? <span className="text-xs font-normal text-slate-400 ml-1">{line.unit}</span> : null}
                        </td>
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
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-medium text-slate-900">{CURRENCY}{fmt(tax)}</span>
            </div>
            {Number(discountAmount) > 0 && (
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
  );
});

QuotationTemplate.displayName = "QuotationTemplate";

export default QuotationTemplate;
