import React from "react";
import { ShoppingCart, MapPin, Calendar, Users, Square, ChefHat, Mail, Phone, Globe, FileText, Heart } from "lucide-react";
import { useTenantStore } from "../../../store/useTenantStore";


/**
 * Beautiful HTML template for Ingredient Purchase List
 * Designed to exactly match the requested orange UI for PDF downloads.
 */
const IngredientPrintTemplate = React.forwardRef(({ event, ingredients }, ref) => {
  const tenant = useTenantStore((state) => state.tenant) || {};
  if (!event || !ingredients) return null;

  // Group ingredients by Category
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const groupName = ing.category || "General / Other";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(ing);
    return acc;
  }, {});
  
  // Calculate total estimated price for items that have it
  const totalEstimatedPrice = ingredients.reduce((sum, ing) => sum + (ing.price ? Number(ing.price) : 0), 0);

  const totalItems = ingredients.length;
  const purchasedItems = ingredients.filter(i => i.isPurchased).length;

  return (
    <div
      ref={ref}
      className="bg-white p-8 max-w-[800px] mx-auto text-slate-800 print:max-w-none print:w-full print:p-8 print:m-0 print:shadow-none font-sans"
      id="ingredient-printable"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8 pb-5 border-b border-slate-300">
        <div className="flex gap-4 items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800 leading-tight">Purchase List</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{event.title}</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex flex-col items-end">
          <div className="whitespace-pre-wrap leading-relaxed text-right mb-3">
            {tenant.pdfFromAddress ? (
              <span className="font-medium text-slate-700">{tenant.pdfFromAddress}</span>
            ) : (
              <>
                {tenant.name && <div className="font-bold text-slate-700">{tenant.name}</div>}
                {tenant.address && <div>{tenant.address}</div>}
                {tenant.contactPhone && <div>{tenant.contactPhone}</div>}
              </>
            )}
          </div>
          <div className="space-y-1.5 text-right">
            <p className="flex items-center gap-2 justify-end"><Calendar size={14} className="text-slate-500" /> <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></p>
            <p className="flex items-center gap-2 justify-end"><Users size={14} className="text-slate-500" /> <span>{event.guestCount || 0} Guests</span></p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 border-b border-slate-300">
            <tr>
              <th className="py-2.5 px-4 text-[10px] font-bold uppercase text-slate-700 w-12 text-center">SL</th>
              <th className="py-2.5 px-4 text-[10px] font-bold uppercase text-slate-700 w-12 text-center">STS</th>
              <th className="py-2.5 px-4 text-[10px] font-bold uppercase text-slate-700">Item Description</th>
              <th className="py-2.5 px-4 text-[10px] font-bold uppercase text-slate-700 text-right w-24">Qty</th>
              <th className="py-2.5 px-4 text-[10px] font-bold uppercase text-slate-700 text-right w-28">Price (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {Object.entries(groupedIngredients).map(([groupName, items]) => (
              <React.Fragment key={groupName}>
                {groupName !== "Other" && (
                  <tr className="bg-slate-50">
                    <td colSpan="5" className="py-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-800">
                      {groupName}
                    </td>
                  </tr>
                )}
                {items.map((ing, idx) => {
                  const name = ing.menu ? ing.menu.name : (ing.inventory ? ing.inventory.name : ing.customName);
                  return (
                    <tr key={ing.id} className={ing.isPurchased ? "bg-slate-50/30" : "bg-white"}>
                      <td className="py-2.5 px-4 text-center text-xs text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 text-center text-xs">
                        {ing.isPurchased ? (
                          <span className="inline-flex w-4 h-4 bg-slate-800 text-white rounded-sm items-center justify-center font-bold text-[10px]">✓</span>
                        ) : (
                          <span className="inline-block w-4 h-4 border-2 border-slate-300 rounded-sm"></span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-sm font-semibold text-slate-700">
                        <span className={ing.isPurchased ? "line-through text-slate-400" : ""}>{name}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-sm">
                        <span className={`font-bold ${ing.isPurchased ? "text-slate-400" : "text-slate-800"}`}>{ing.quantity}</span> 
                        <span className="text-xs text-slate-500 ml-1">{ing.unit}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-sm">
                        {ing.price ? (
                          <span className={`font-bold ${ing.isPurchased ? "text-slate-400" : "text-slate-700"}`}>{ing.price}</span>
                        ) : (
                          <span className="text-slate-300">______</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {Object.keys(groupedIngredients).length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm italic border-t border-slate-200">
            No items added to this event yet.
          </div>
        )}
      </div>

      {totalEstimatedPrice > 0 && (
        <div className="flex justify-end mt-6 pt-4 border-t border-slate-300 avoid-page-break">
          <div className="bg-slate-50 border border-slate-300 rounded-lg px-5 py-3 flex items-center justify-between w-64 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Estimated Total</span>
            <span className="text-lg font-black text-slate-900">₹{totalEstimatedPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          #ingredient-printable, #ingredient-printable * {
            visibility: visible;
          }
          #ingredient-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            box-shadow: none;
          }
          .avoid-page-break {
            page-break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
});

export default IngredientPrintTemplate;
