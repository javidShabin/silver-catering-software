import { CURRENCY } from "../../config/currency";
import React from "react";
import { useTenantStore } from "../../store/useTenantStore";


/**
 * Minimal & Professional Invoice Template
 */
const InvoiceTemplate = React.forwardRef(({ invoice, viewMode = 'client' }, ref) => {
  const tenant = useTenantStore((state) => state.tenant) || {};
  if (!invoice) return null;
  const pdfSettings = tenant.pdfSettings || {
    showCustomerContact: true,
    showCustomerAddress: true,
    showEventDetails: true,
    showTax: true,
    showDiscount: true,
    showItemQuantity: true,
    showItemUnitPrice: true,
    showItemTotalPrice: true
  };

  const {
    invoiceNumber,
    customer,
    event,
    items,
    subtotal,
    tax,
    totalAmount,
    advancePaid,
    balanceAmount,
    status,
    dueDate,
    notes,
    createdAt
  } = invoice;

  return (
    <div 
      ref={ref} 
      className="bg-white p-10 max-w-[800px] mx-auto text-slate-800 font-sans print:max-w-none print:w-full print:mx-0 print:p-8"
      id="invoice-printable"
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
            {tenant.name || "Catering Company"}
          </h2>
          <div className="text-sm text-slate-500 mt-2 space-y-1 whitespace-pre-wrap leading-relaxed">
            {tenant.pdfFromAddress || (
              <>
                <p>{tenant.address || "123 Gourmet Way, Culinary City, NY 10001"}</p>
                <p>{tenant.contactEmail || "billing@example.com"}</p>
                <p>{tenant.contactPhone || "+1 (555) 000-1234"}</p>
                {tenant.website && <p>{tenant.website}</p>}
              </>
            )}
            {tenant.taxNumber && (
              <p className="mt-2 text-xs font-semibold text-slate-600">
                Tax No: {tenant.taxNumber} {tenant.taxDetails ? `| ${tenant.taxDetails}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-4">Invoice</h1>
          <div className="text-sm space-y-1">
            <p className="text-slate-500"><span className="font-semibold text-slate-700">Invoice No:</span> {invoiceNumber}</p>
            <p className="text-slate-500"><span className="font-semibold text-slate-700">Date:</span> {createdAt ? new Date(createdAt).toLocaleDateString() : ""}</p>
            <div className="mt-2 inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded border border-slate-200">
              Status: <span className={
                status === 'paid' ? 'text-emerald-600' : 
                status === 'overdue' ? 'text-red-600' : 'text-amber-600'
              }>{status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 my-8"></div>

      {/* Bill To & Details */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h4>
          <div className="text-sm space-y-1 text-slate-700">
            <p className="font-semibold text-slate-900">{customer?.name}</p>
            {pdfSettings.showCustomerContact && customer?.email && <p>{customer.email}</p>}
            {pdfSettings.showCustomerContact && customer?.phone && <p>{customer.phone}</p>}
            {pdfSettings.showCustomerAddress && customer?.address && <p className="max-w-[250px] whitespace-pre-wrap leading-relaxed">{customer.address}</p>}
          </div>
        </div>
        
        {pdfSettings.showEventDetails && (
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Event Details</h4>
            <div className="text-sm space-y-1 text-slate-700">
              <p className="font-semibold text-slate-900">{event?.title}</p>
              <p>Date: {event?.date ? new Date(event.date).toLocaleDateString() : ""}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 text-slate-900">
              <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider w-12 text-center">#</th>
              <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider">Description</th>
              {pdfSettings.showItemQuantity !== false && <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-center w-24">Qty</th>}
              {pdfSettings.showItemUnitPrice !== false && <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-32">Unit Price</th>}
              {pdfSettings.showItemTotalPrice !== false && <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-32">Total</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(() => {
              const itemsByCategory = {};
              const menuItems = event?.menuItems || [];
              let colSpanCount = 2;
              if (pdfSettings.showItemQuantity !== false) colSpanCount++;
              if (pdfSettings.showItemUnitPrice !== false) colSpanCount++;
              if (pdfSettings.showItemTotalPrice !== false) colSpanCount++;

              (items || []).forEach(item => {
                let category = "Other Services";
                const match = menuItems.find(m => item.description.includes(m.name));
                if (match && match.category) {
                  category = match.category;
                }
                
                if (!itemsByCategory[category]) itemsByCategory[category] = [];
                itemsByCategory[category].push(item);
              });

              const categories = Object.keys(itemsByCategory).sort((a, b) => {
                if (a === "Other Services") return 1;
                if (b === "Other Services") return -1;
                return a.localeCompare(b);
              });

              let globalItemIndex = 1;

              return categories.map(category => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-slate-50">
                    <td colSpan={colSpanCount} className="py-2 px-2 text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200">
                      {category}
                    </td>
                  </tr>
                  
                  {/* Category Items */}
                  {itemsByCategory[category].map((item, index) => (
                    <tr key={`${category}-${index}`}>
                      <td className="py-4 px-2 text-center text-sm text-slate-500">{globalItemIndex++}</td>
                      <td className="py-4 px-2">
                        <p className="text-sm font-medium text-slate-800">{item.description}</p>
                      </td>
                      {pdfSettings.showItemQuantity !== false && (
                      <td className="py-4 px-2 text-center text-sm text-slate-600">
                        {item.quantity}
                      </td>
                      )}
                      {pdfSettings.showItemUnitPrice !== false && (
                      <td className="py-4 px-2 text-right text-sm text-slate-600">
                        {CURRENCY}{item.unitPrice?.toLocaleString()}
                      </td>
                      )}
                      {pdfSettings.showItemTotalPrice !== false && (
                      <td className="py-4 px-2 text-right text-sm font-semibold text-slate-900">
                        {CURRENCY}{item.total?.toLocaleString()}
                      </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Extra Charges Section */}
      {event?.extraBills && event.extraBills.length > 0 && (
        <div className="mb-8">
          <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-2">Extra Charges</h4>
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-50 bg-slate-50/50">
              {event.extraBills.map((bill, index) => (
                <tr key={index}>
                  <td className="py-3 px-2 pl-4">
                    <p className="text-sm font-medium text-slate-800">{bill.description}</p>
                  </td>
                  <td className="py-3 px-2 text-right text-sm font-semibold text-slate-900 w-32">
                    {CURRENCY}{Number(bill.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-[320px]">
          <div className="space-y-2 px-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{CURRENCY}{subtotal?.toLocaleString()}</span>
            </div>
            {pdfSettings.showTax !== false && (
            <div className="flex justify-between">
              <span>Tax ({invoice.taxRate || 0}%)</span>
              <span className="font-medium text-slate-900">{CURRENCY}{tax?.toLocaleString()}</span>
            </div>
            )}
            {pdfSettings.showDiscount !== false && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-medium text-slate-900">-{CURRENCY}{(invoice.discountAmount || 0).toLocaleString()}</span>
            </div>
            )}
          </div>
          
          <div className="border-t border-slate-200 my-3"></div>
          
          <div className="flex justify-between items-center px-2 mb-4">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total</span>
            <span className="text-xl font-bold text-slate-900">{CURRENCY}{totalAmount?.toLocaleString()}</span>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded p-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Advance Paid</span>
              <span className="font-medium text-slate-900">-{CURRENCY}{advancePaid?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Balance Due</span>
              <span className="text-lg font-bold text-slate-900">{CURRENCY}{balanceAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Owner View: Profit & Loss Analysis */}
      {viewMode === 'owner' && (
        <div className="mb-12 border border-slate-200 bg-slate-50 p-6 rounded relative">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
            Internal Financial Analysis
          </h4>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Internal Extra Costs</h5>
              {event?.extraBills && event.extraBills.length > 0 ? (
                <div className="space-y-2">
                  {event.extraBills.map((bill, index) => (
                    <div key={index} className="flex justify-between text-xs border-b border-slate-200 pb-1">
                      <span className="text-slate-600">{bill.description}</span>
                      <span className="text-slate-900 font-medium">{CURRENCY}{Number(bill.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-slate-800 font-semibold">Total Internal Costs</span>
                    <span className="text-slate-900 font-bold">
                      {CURRENCY}{event.extraBills.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No extra internal costs recorded.</p>
              )}
            </div>
            <div className="bg-white p-4 rounded border border-slate-200 flex flex-col justify-center">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Profit / Loss</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Revenue</span>
                  <span className="text-emerald-700 font-medium">{CURRENCY}{totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Internal Costs</span>
                  <span className="text-red-700 font-medium">
                    -{CURRENCY}{(event?.extraBills?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                  <span className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Net Profit</span>
                  <span className="text-lg font-bold text-slate-900">
                    {CURRENCY}{(totalAmount - (event?.extraBills?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Terms & Signatory) */}
      <div className="border-t border-slate-200 pt-8 mt-8">
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Terms & Notes</h4>
            <div className="text-xs text-slate-500 leading-relaxed space-y-1">
              {notes ? (
                <p>{notes}</p>
              ) : (
                <>
                  <p>Please make payment within the due date.</p>
                  <p>Thank you for your business.</p>
                </>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col justify-end items-end">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Authorized Signatory</p>
            <div className="border-b border-slate-400 w-48 mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";

export default InvoiceTemplate;
