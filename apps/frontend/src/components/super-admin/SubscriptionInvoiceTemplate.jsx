import React from "react";
import { Receipt, Mail, Phone, MapPin, Calendar, CreditCard, Shield, Globe, FileText, Heart, Sparkles } from "lucide-react";

const FEATURE_LABELS = {
  dashboard: "Dashboard & Analytics Addon",
  events: "Event Management Addon",
  customers: "Customer CRM Addon",
  calendar: "Event Calendar Addon",
  inventory: "Inventory Management Addon",
  purchases: "Purchase Orders Addon",
  menu: "Menu Management Addon",
  kitchen: "Kitchen Workflow Addon",
  deliveries: "Delivery Tracking Addon",
  billing: "Billing & Invoicing Addon",
  quotations: "Quotations Builder Addon",
  expenses: "Expense Tracker Addon",
  staff: "Staff Management Addon",
  settings: "Workspace Settings Addon",
  notifications: "System Notifications Addon"
};

// Hex colors definition to bypass Tailwind v4 oklch() color issues in html2canvas
const colors = {
  white: "#ffffff",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",
  indigo50: "#e0e7ff",
  indigo100: "#e0e7ff",
  indigo200: "#c7d2fe",
  indigo500: "#6366f1",
  indigo600: "#4f46e5",
  indigo700: "#4338ca",
  green50: "#f0fdf4",
  green600: "#16a34a",
  red50: "#fef2f2",
  red600: "#dc2626"
};

/**
 * Premium Subscription Invoice Template
 * Rendered with static hex styles for maximum compatibility with html2canvas.
 */
const SubscriptionInvoiceTemplate = React.forwardRef(({ invoice, tenant }, ref) => {
  if (!invoice || !tenant) return null;

  const {
    invoiceNumber,
    period,
    billingDate,
    dueDate,
    amount,
    status,
    planName,
    planPrice,
    customFeaturePrices
  } = invoice;

  const isYearly = period === "Yearly";
  const factor = isYearly ? 12 : 1;

  // Read billing details from localStorage with default fallbacks
  const billingAddress = localStorage.getItem("saas_billing_address") || "123 Cloud Heights, Tech Hub, BLR 560001";
  const billingEmail = localStorage.getItem("saas_billing_email") || "billing@docaterpro.com";
  const billingPhone = localStorage.getItem("saas_billing_phone") || "+91 (80) 555-9000";

  // Compile invoice items
  const items = [
    {
      description: `${planName} Subscription Plan (${period})`,
      quantity: 1,
      unitPrice: planPrice * factor,
      total: planPrice * factor
    }
  ];

  if (customFeaturePrices && typeof customFeaturePrices === "object") {
    const enabledCustom = tenant.customFeatures || [];
    for (const [feat, price] of Object.entries(customFeaturePrices)) {
      if (enabledCustom.includes(feat) && Number(price) > 0) {
        items.push({
          description: `${FEATURE_LABELS[feat] || feat} (${period} Addon)`,
          quantity: 1,
          unitPrice: Number(price) * factor,
          total: Number(price) * factor
        });
      }
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = 0; // 0% GST/Tax

  return (
    <div 
      ref={ref} 
      className="max-w-[620px] mx-auto print:max-w-none print:w-full print:mx-0 rounded-2xl border shadow-sm"
      style={{
        backgroundColor: colors.white,
        borderColor: colors.slate100,
        color: colors.slate800,
        padding: "20px"
      }}
      id="tenant-invoice-printable"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <div className="flex items-center gap-2 mb-1" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div 
              className="rounded-lg flex items-center justify-center shrink-0" 
              style={{ 
                width: "34px", 
                height: "34px", 
                backgroundColor: colors.indigo600, 
                color: colors.white,
                padding: "6px" 
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight leading-none uppercase" style={{ display: "flex", fontSize: "18px", fontWeight: 900, lineHeight: 1 }}>
                <span style={{ color: colors.slate800 }}>CATER</span>
                <span style={{ color: colors.indigo600 }}>PRO</span>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5" style={{ color: colors.slate400, fontSize: "8px", fontWeight: "bold", letterSpacing: "0.1em", marginTop: "2px" }}>SaaS Platform Billing</p>
            </div>
          </div>
          
          <div className="text-[10px] space-y-0.5 mt-2" style={{ color: colors.slate600, fontSize: "10px", marginTop: "8px" }}>
            <p className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={10} style={{ color: colors.indigo600 }} /> {billingAddress}
            </p>
            <p className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={10} style={{ color: colors.indigo600 }} /> {billingEmail}
            </p>
            <p className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Phone size={10} style={{ color: colors.indigo600 }} /> {billingPhone}
            </p>
          </div>
        </div>

        <div className="text-right" style={{ textAlign: "right" }}>
          <h1 className="text-xl font-black uppercase tracking-tight mb-1" style={{ color: colors.indigo600, fontSize: "20px", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: "4px" }}>INVOICE</h1>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
            <p className="font-bold uppercase tracking-widest text-[7px]" style={{ color: colors.slate400, fontSize: "7px", letterSpacing: "0.1em" }}>INVOICE NUMBER</p>
            <p className="text-sm font-bold leading-none" style={{ color: colors.slate900, fontSize: "14px", fontWeight: "bold", lineHeight: 1 }}>{invoiceNumber}</p>
            <div 
              className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest mt-1" 
              style={
                status === "paid" 
                  ? { border: `1px solid ${colors.green600}`, color: colors.green600, backgroundColor: colors.green50, fontSize: "8px", fontWeight: "bold", letterSpacing: "0.15em", marginTop: "4px" } 
                  : status === "overdue" 
                    ? { border: `1px solid ${colors.red600}`, color: colors.red600, backgroundColor: colors.red50, fontSize: "8px", fontWeight: "bold", letterSpacing: "0.15em", marginTop: "4px" } 
                    : { border: `1px solid ${colors.indigo600}`, color: colors.indigo600, backgroundColor: colors.indigo50, fontSize: "8px", fontWeight: "bold", letterSpacing: "0.15em", marginTop: "4px" }
              }
            >
              {status}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${colors.slate100}`, margin: "12px 0" }}></div>

      {/* Bill To & Details Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3 text-[11px]" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginBottom: "12px", fontSize: "11px" }}>
        <div>
          <h4 className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.indigo600, fontSize: "8px", fontWeight: "bold", letterSpacing: "0.1em", marginBottom: "4px" }}>BILL TO (COMPANY)</h4>
          <div className="space-y-0.5" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <p className="text-xs font-bold" style={{ color: colors.slate900, fontSize: "12px", fontWeight: "bold" }}>{tenant.name}</p>
            <p style={{ color: colors.slate600 }}>{tenant.contactEmail || "No contact email"}</p>
            <p style={{ color: colors.slate600 }}>{tenant.contactPhone || "No contact phone"}</p>
            {tenant.address && <p className="leading-tight mt-0.5" style={{ color: colors.slate500, maxWidth: "160px", lineHeight: 1.25, marginTop: "2px" }}>{tenant.address}</p>}
          </div>
        </div>
        
        <div style={{ borderLeft: `1px solid ${colors.slate100}`, paddingLeft: "12px" }}>
          <h4 className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.indigo600, fontSize: "8px", fontWeight: "bold", letterSpacing: "0.1em", marginBottom: "4px" }}>BILLING DETAILS</h4>
          <p style={{ color: colors.slate850 }}>Plan: <span style={{ color: colors.indigo700, fontWeight: "bold" }}>{planName}</span></p>
          <p style={{ color: colors.slate500, marginTop: "2px" }}>Period: <span style={{ color: colors.slate700, fontWeight: "bold", textTransform: "uppercase", fontSize: "10px" }}>{period}</span></p>
          <p className="flex items-center gap-1 mt-1" style={{ display: "flex", alignItems: "center", gap: "4px", color: colors.slate500, marginTop: "4px" }}>
            <Calendar size={10} style={{ color: colors.indigo500 }} />
            Billed: {new Date(billingDate).toLocaleDateString("en-IN")}
          </p>
        </div>

        <div style={{ borderLeft: `1px solid ${colors.slate100}`, paddingLeft: "12px" }}>
          <h4 className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.indigo600, fontSize: "8px", fontWeight: "bold", letterSpacing: "0.1em", marginBottom: "4px" }}>DUE DATE</h4>
          <p className="text-xs font-bold" style={{ color: colors.slate900, fontSize: "12px", fontWeight: "bold" }}>{dueDate ? new Date(dueDate).toLocaleDateString("en-IN", {month:"short", day:"numeric", year:"numeric"}) : ""}</p>
          <p className="text-[8px] mt-1 uppercase font-medium" style={{ color: colors.slate400, fontSize: "8px", textTransform: "uppercase", marginTop: "4px" }}>Auto platform bill</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-3 rounded-xl overflow-hidden" style={{ marginBottom: "12px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${colors.slate100}` }}>
        <table className="w-full text-left text-[11px]" style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: colors.indigo600, color: colors.white }}>
              <th style={{ padding: "6px 10px", fontSize: "8px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "32px" }}>#</th>
              <th style={{ padding: "6px 10px", fontSize: "8px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>DESCRIPTION</th>
              <th style={{ padding: "6px 10px", fontSize: "8px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "64px" }}>QTY</th>
              <th style={{ padding: "6px 10px", fontSize: "8px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right", width: "80px" }}>RATE</th>
              <th style={{ padding: "6px 10px", fontSize: "8px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right", width: "80px" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: `1px solid ${colors.slate100}`, backgroundColor: colors.white }}>
                <td style={{ padding: "6px 10px", textAlign: "center", fontWeight: "bold", color: colors.slate900 }}>{index + 1}</td>
                <td style={{ padding: "6px 10px", fontWeight: 600, color: colors.slate800 }}>{item.description}</td>
                <td style={{ padding: "6px 10px", textAlign: "center", color: colors.slate600 }}>{item.quantity}</td>
                <td style={{ padding: "6px 10px", textAlign: "right", color: colors.slate600 }}>₹{item.unitPrice.toLocaleString("en-IN")}</td>
                <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: "bold", color: colors.slate900 }}>₹{item.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-3" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <div style={{ width: "240px", fontSize: "11px" }}>
          <div className="space-y-1" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: colors.slate500 }}>Subtotal</span>
              <span style={{ color: colors.slate900, fontWeight: "medium" }}>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: colors.slate500 }}>Platform Tax (0%)</span>
              <span style={{ color: colors.slate900, fontWeight: "medium" }}>₹{tax.toLocaleString("en-IN")}</span>
            </div>
          </div>
          
          <div style={{ borderTop: `1px solid ${colors.indigo100}`, margin: "6px 0" }}></div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
            <span style={{ color: colors.indigo600, fontWeight: "bold", letterSpacing: "0.1em", fontSize: "9px" }}>TOTAL DUE</span>
            <span style={{ color: colors.indigo600, fontSize: "18px", fontWeight: 900 }}>₹{amount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Footer (Terms & Signatory) */}
      <div style={{ borderTop: `1px solid ${colors.indigo100}`, paddingTop: "12px", marginBottom: "12px", fontSize: "9px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
          <div>
            <h4 style={{ color: colors.indigo600, fontWeight: "bold", letterSpacing: "0.1em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <FileText size={10} /> TERMS & INFO
            </h4>
            <div style={{ color: colors.slate500, lineHeight: 1.4 }}>
              <p>Charges are for the selected billing cycle.</p>
              <p>Please clear dues on time to avoid service suspension.</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end", textAlign: "right" }}>
            <p style={{ color: colors.indigo600, fontWeight: "bold", letterSpacing: "0.1em", marginBottom: "8px", fontSize: "8px" }}>DOCATERPRO FINANCE MANAGER</p>
            <div style={{ borderBottom: `1px solid ${colors.slate300}`, width: "112px", marginTop: "8px" }}></div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div style={{ borderTop: `1px solid ${colors.slate100}`, textAlign: "center", paddingTop: "8px", marginTop: "12px" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", backgroundColor: colors.white, padding: "0 8px" }}>
          <div 
            className="rounded-full flex items-center justify-center" 
            style={{ 
              width: "14px", 
              height: "14px", 
              backgroundColor: colors.indigo600, 
              color: colors.white, 
              marginBottom: "2px",
              padding: "2px"
            }}
          >
            <Sparkles size={8} fill="currentColor" />
          </div>
          <p style={{ color: colors.indigo500, fontSize: "6.5px", fontWeight: "bold", letterSpacing: "0.2em", lineHeight: 1 }}>OFFICIAL DOCATERPRO SaaS SUBSCRIPTION DOCUMENT</p>
        </div>
      </div>
    </div>
  );
});

SubscriptionInvoiceTemplate.displayName = "SubscriptionInvoiceTemplate";

export default SubscriptionInvoiceTemplate;
