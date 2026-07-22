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

  // Build line items from real data
  const menuLines = menus.map((menu) => {
    const sel = selections[menu.id] || {};
    const isPackageItem = Boolean(sel.packageId);
    const type = sel.type || "PER_HEAD";
    const price = isPackageItem ? 0 : Number(sel.price) || 0;
    const qty = isPackageItem ? 1 : type === "PER_HEAD" ? Number(guestCount) || 1 : Number(sel.quantity) || 1;
    const total = price * qty;
    return {
      description: menu.name,
      note: isPackageItem ? "Package item" : type === "PER_HEAD" ? `Per head × ${qty} guests` : `Fixed price`,
      qty,
      unitPrice: price,
      total,
    };
  });

  const cateringBoyCost =
    Number(cateringBoysCount) > 0
      ? Number(cateringBoysCount) * Number(cateringBoyRate || 0) * Number(durationInDays || 1)
      : 0;

  const allLines = [
    ...packageLines,
    ...menuLines,
    ...allocations
      .map((a) => ({
        description: `${a.name} (Equipment Rental)`,
        note: `${a.quantity} ${a.unit} × ${durationInDays} day(s)`,
        qty: Number(a.quantity) || 1,
        unitPrice: Number(a.rentPerDay || 0),
        total: Number(a.quantity || 1) * Number(a.rentPerDay || 0) * Number(durationInDays || 1),
      })),
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
      unitPrice: Number(s.rate || 0),
      total: (Number(s.count) || 0) * Number(s.rate || 0) * Number(durationInDays || 1),
    })),
    ...extras.map((item) => ({
      description: item.description,
      note: null,
      qty: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
    })),
  ];

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      ref={ref}
      id="quotation-printable"
      style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12px", color: "#1a1a1a", background: "#fff", padding: "40px", maxWidth: "800px", margin: "0 auto" }}
    >
      {/* Header */}
      <table style={{ width: "100%", marginBottom: "28px" }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: "top" }}>
              {tenant.logoUrl && (
                <div style={{ marginBottom: "8px" }}>
                  <img 
                    src={tenant.logoUrl.startsWith('http') ? tenant.logoUrl : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${tenant.logoUrl}`} 
                    alt="Logo" 
                    style={{ maxHeight: "60px", objectFit: "contain" }} 
                  />
                </div>
              )}
              <div style={{ fontSize: tenant.logoUrl ? "14px" : "22px", fontWeight: "800", letterSpacing: "-0.5px", color: "#111" }}>
                {tenant.name || "Your Company"}
              </div>
              <div style={{ marginTop: "6px", fontSize: "11px", color: "#555", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                {tenant.pdfFromAddress || (
                  <>
                    {tenant.address && <div>{tenant.address}</div>}
                    {tenant.contactEmail && <div>{tenant.contactEmail}</div>}
                    {tenant.contactPhone && <div>{tenant.contactPhone}</div>}
                  </>
                )}
              </div>
            </td>
            <td style={{ verticalAlign: "top", textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#111", letterSpacing: "1px", textTransform: "uppercase" }}>
                Quotation
              </div>
              <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: "700", color: "#111" }}>
                {quotationNumber}
              </div>
              <div style={{ marginTop: "4px", fontSize: "11px", color: "#777" }}>
                Status: <span style={{ textTransform: "uppercase", fontWeight: "600" }}>{status || "Draft"}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: "2px solid #333", marginBottom: "24px" }} />

      {/* Bill To + Details */}
      <table style={{ width: "100%", marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: "top", width: "40%" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#333", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Prepared For
              </div>
              <div style={{ fontSize: "13px", fontWeight: "700" }}>{customer?.name || "—"}</div>
              {customer?.email && <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>{customer.email}</div>}
              {customer?.phone && <div style={{ fontSize: "11px", color: "#555" }}>{customer.phone}</div>}
              {customer?.address && <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>{customer.address}</div>}
            </td>
            <td style={{ verticalAlign: "top", width: "30%", paddingLeft: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#333", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Event Details
              </div>
              <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.9" }}>
                <div>Guests: <strong>{guestCount}</strong></div>
                <div>Duration: <strong>{durationInDays} day(s)</strong></div>
                {Number(cateringBoysCount) > 0 && (
                  <div>Catering Boys: <strong>{cateringBoysCount}</strong> (Legacy)</div>
                )}
                {staff.map((s, idx) => (
                  <div key={idx}>{s.role}: <strong>{s.count}</strong></div>
                ))}
              </div>
            </td>
            <td style={{ verticalAlign: "top", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#333", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Dates
              </div>
              <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.9" }}>
                <div>Issued: <strong>{createdAt ? new Date(createdAt).toLocaleDateString("en-IN") : "—"}</strong></div>
                <div>Valid Until: <strong>{validUntil ? new Date(validUntil).toLocaleDateString("en-IN") : "—"}</strong></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
        <thead>
          <tr style={{ background: "#f8fafc", color: "#111", borderBottom: "2px solid #333" }}>
            <th style={{ padding: "9px 12px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", width: "36px" }}>#</th>
            <th style={{ padding: "9px 12px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" }}>Description</th>
            <th style={{ padding: "9px 12px", textAlign: "right", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", width: "100px" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {allLines.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: "16px 12px", textAlign: "center", color: "#999", fontSize: "11px", borderBottom: "1px solid #e5e7eb" }}>
                No items found
              </td>
            </tr>
          ) : (
            allLines.map((line, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "#666", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>{i + 1}</td>
                <td style={{ padding: "9px 12px", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#111" }}>{line.description}</div>
                  {line.note && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>{line.note}</div>}
                </td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#111", borderBottom: "1px solid #e5e7eb" }}>{CURRENCY}{fmt(line.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <table style={{ width: "100%", marginBottom: "28px" }}>
        <tbody>
          <tr>
            <td style={{ width: "55%" }} />
            <td>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "5px 0", fontSize: "12px", color: "#555" }}>Subtotal</td>
                    <td style={{ padding: "5px 0", fontSize: "12px", textAlign: "right", fontWeight: "600" }}>{CURRENCY}{fmt(subtotal)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px 0", fontSize: "12px", color: "#555" }}>Tax</td>
                    <td style={{ padding: "5px 0", fontSize: "12px", textAlign: "right", fontWeight: "600" }}>{CURRENCY}{fmt(tax)}</td>
                  </tr>
                  {Number(discountAmount) > 0 && (
                    <tr>
                      <td style={{ padding: "5px 0", fontSize: "12px", color: "#16a34a" }}>Discount</td>
                      <td style={{ padding: "5px 0", fontSize: "12px", textAlign: "right", fontWeight: "600", color: "#16a34a" }}>-{CURRENCY}{fmt(discountAmount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={2} style={{ paddingTop: "8px" }}>
                      <div style={{ borderTop: "2px solid #333" }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0 0", fontSize: "12px", fontWeight: "800", color: "#111" }}>Total</td>
                    <td style={{ padding: "8px 0 0", fontSize: "14px", fontWeight: "900", textAlign: "right", color: "#111" }}>{CURRENCY}{fmt(totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes / Terms */}
      {notes && (
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#333", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Notes</div>
          <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.7" }}>{notes}</div>
        </div>
      )}

      {/* Signature */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderBottom: "1px solid #aaa", width: "180px", marginBottom: "6px" }} />
          <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>Authorized Signatory</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "10px", color: "#aaa" }}>
        This is an estimate and not a final invoice. Prices may vary.
      </div>
    </div>
  );
});

QuotationTemplate.displayName = "QuotationTemplate";

export default QuotationTemplate;
