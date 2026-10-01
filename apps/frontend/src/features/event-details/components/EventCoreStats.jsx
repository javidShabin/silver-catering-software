import { CURRENCY } from "../../../config/currency";
import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, Users, Layers } from "lucide-react";
import { eventApi } from "../../../api/eventApi";
import { useTenantStore } from "../../../store/useTenantStore";


const EventCoreStats = ({ event, setEvent, isSaving, setIsSaving, setToast }) => {
  // Parse custom selections safely
  const safeCustomSelections = useMemo(() => {
    if (!event.customMenuSelections) return {};
    if (typeof event.customMenuSelections === 'string') {
      try { return JSON.parse(event.customMenuSelections); } catch(e) { return {}; }
    }
    return event.customMenuSelections;
  }, [event.customMenuSelections]);

  const safeCustomPrices = useMemo(() => {
    if (!event.customMenuPrices) return {};
    if (typeof event.customMenuPrices === 'string') {
      try { return JSON.parse(event.customMenuPrices); } catch(e) { return {}; }
    }
    return event.customMenuPrices;
  }, [event.customMenuPrices]);

  const activePackageId = event.packageId || (safeCustomSelections ? Object.values(safeCustomSelections).find(s => s.packageId)?.packageId : null);

  let packagePricePerHead = 0;
  if (activePackageId && safeCustomSelections) {
    const pkgSelection = Object.values(safeCustomSelections).find(sel => sel.packageId === activePackageId);
    if (pkgSelection) {
       packagePricePerHead = Number(pkgSelection.packagePricePerHead || 0);
    }
  }
  const packageTotal = activePackageId ? packagePricePerHead * (event.guestCount || 1) * (event.durationInDays || 1) : 0;

  const menusTotal = (event.menuItems?.reduce((acc, menu) => {
    let price = Number(menu.minPrice || 0);
    let qty = (event.guestCount || 1) * (event.durationInDays || 1);
    
    const sel = safeCustomSelections?.[menu.id];
    if (sel) {
      if (sel.packageId) {
        price = 0; // Package items have their cost covered by the package itself
      } else {
        price = Number((sel.price !== undefined && sel.price !== null && sel.price !== "") ? sel.price : menu.minPrice);
      }
      if (sel.type === "PER_UNIT") {
        qty = (Number(sel.quantity) || 1) * (event.durationInDays || 1);
      }
    } else if (safeCustomPrices?.[menu.id] !== undefined) {
      price = Number(safeCustomPrices[menu.id]);
    }

    return acc + (price * qty);
  }, 0) || 0) + packageTotal;

  const ingredientsTotal = event.eventIngredients?.reduce((acc, ing) => {
    return acc + (ing.price ? Number(ing.price) : 0);
  }, 0) || 0;

  const eventFee = Number(event.eventFee || 0);
  const extraBillsTotal = event.extraBills?.reduce((acc, bill) => acc + Number(bill.amount || 0), 0) || 0;

  const inventoryRentTotal = event.inventoryAllocations?.reduce((acc, alloc) => {
    const inventoryItem = event.inventoryItems?.find(i => i.id === alloc.inventoryId);
    const rentPerDay = Number(inventoryItem?.rentPerDay || 0);
    const qty = Number(alloc.quantity || 0);
    const duration = Number(event.durationInDays || 1);
    return acc + (rentPerDay * qty * duration);
  }, 0) || 0;



  // Catering Boys Calculation (Legacy)
  const cateringBoysCount = Number(event.cateringBoysCount || 0);
  const cateringBoyRate = Number(event.cateringBoyRate || 0);
  const cateringBoysTotal = cateringBoysCount * cateringBoyRate * Number(event.durationInDays || 1);

  // Dynamic Staff Allocations
  let parsedStaffAllocations = [];
  if (event.staffAllocations) {
    if (typeof event.staffAllocations === 'string') {
      try { parsedStaffAllocations = JSON.parse(event.staffAllocations); } catch(e) {}
    } else {
      parsedStaffAllocations = event.staffAllocations;
    }
  }

  const staffAllocationsTotal = Array.isArray(parsedStaffAllocations) 
    ? parsedStaffAllocations.reduce((acc, staff) => acc + (Number(staff.count || 0) * Number(staff.rate || 0) * Number(event.durationInDays || 1)), 0)
    : 0;

  const totalStaffCost = cateringBoysTotal + staffAllocationsTotal;

  // Extract invoice data for accurate billing totals
  const invoice = event.invoices?.[0];
  
  // Use dynamic subtotal to reflect live changes on the frontend
  const subTotal = menusTotal + eventFee + inventoryRentTotal + totalStaffCost;
  const taxAmount = invoice ? Number(invoice.tax) : 0;
  const discountAmount = invoice ? Number(invoice.discountAmount) : 0;
  const grandTotal = invoice ? Number(invoice.totalAmount) : subTotal;
  const advance = invoice ? Number(invoice.advancePaid) : Number(event.advanceAmount || 0);
  const balance = invoice ? Number(invoice.balanceAmount) : (subTotal - advance);
  
  const tenant = useTenantStore((state) => state.tenant) || {};

  const [localTaxRate, setLocalTaxRate] = useState(invoice?.taxRate !== undefined ? invoice.taxRate : (tenant?.taxPercentage || 0));
  const [localDiscount, setLocalDiscount] = useState(invoice?.discountValue !== undefined ? invoice.discountValue : 0);
  
  // Live calculation based on local inputs
  const liveTaxAmount = subTotal * (Number(localTaxRate) / 100);
  const liveDiscountAmount = Number(localDiscount);
  const liveGrandTotal = subTotal + liveTaxAmount;
  const liveBalance = liveGrandTotal - liveDiscountAmount - advance;

  const isFinancialsChanged = 
    Number(localTaxRate) !== Number(invoice?.taxRate || 0) || 
    Number(localDiscount) !== Number(invoice?.discountValue || 0);

  useEffect(() => {
    if (invoice) {
      setLocalTaxRate(invoice.taxRate !== undefined ? invoice.taxRate : (tenant?.taxPercentage || 0));
      setLocalDiscount(invoice.discountValue !== undefined ? invoice.discountValue : 0);
    } else {
      setLocalTaxRate(tenant?.taxPercentage || 0);
    }
  }, [invoice, tenant]);

  const handleUpdateFinancials = async () => {
    try {
      if (
        Number(localTaxRate) === Number(invoice?.taxRate || 0) &&
        Number(localDiscount) === Number(invoice?.discountValue || 0)
      ) return; // Skip if unchanged

      const numDiscount = Number(localDiscount || 0);
      const maxAllowed = subTotal + liveTaxAmount;
      if (numDiscount < 0) {
        setToast({ message: "Discount cannot be negative", type: "error" });
        return;
      }
      if (numDiscount > maxAllowed) {
        setToast({ message: `Discount cannot exceed total amount (${CURRENCY}${maxAllowed.toFixed(2)})`, type: "error" });
        return;
      }

      setIsSaving(true);
      await eventApi.update(event.id, {
        taxRate: Number(localTaxRate),
        discountValue: Number(localDiscount)
      });
      const updatedEventRes = await eventApi.getById(event.id);
      setEvent(updatedEventRes.data);
      setToast({ message: "Financials updated successfully", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to update financials", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Catering Event</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{event.title}</h1>
          {event.description && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed whitespace-pre-line bg-slate-50/40 p-3 rounded-2xl border border-slate-100/50">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Quick Fact Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-1">
        <div className="bg-slate-50/70 border border-slate-100/60 rounded-2xl p-3.5 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Date</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">
              {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {event.durationInDays > 1 ? ` (${event.durationInDays} Days)` : ""}
            </span>
          </div>
        </div>
        <div className="bg-slate-50/70 border border-slate-100/60 rounded-2xl p-3.5 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Time</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{event.time}</span>
          </div>
        </div>
        <div className="bg-slate-50/70 border border-slate-100/60 rounded-2xl p-3.5 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Guests Count</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Users size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{event.guestCount || 0} People</span>
          </div>
        </div>
        <div className="bg-slate-50/70 border border-slate-100/60 rounded-2xl p-3.5 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Event Mode</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 capitalize">
            <Layers size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{event.type || "Catering"}</span>
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-100/60 rounded-2xl p-3.5 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Staffing</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 capitalize">
            <Users size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">
              {CURRENCY}{totalStaffCost.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        
      </div>

      {/* Compact Financial Overview */}
      <div className="pt-3 border-t border-slate-100/60">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Financial Overview</h3>
          
          <div className="flex items-center gap-2">
            {isFinancialsChanged && (
              <button 
                onClick={handleUpdateFinancials}
                disabled={isSaving}
                className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-md transition-colors shadow-sm disabled:opacity-50 mr-1 animate-in fade-in"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 transition-all" title="Tax rate can only be edited in Settings">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Tax %</span>
              <input
                type="number"
                min="0"
                value={localTaxRate}
                disabled={true}
                className="w-10 bg-transparent text-xs font-bold text-slate-500 focus:outline-none text-right cursor-not-allowed"
              />
            </div>
            
            <div className="flex items-center gap-1.5 bg-emerald-50/50 border border-emerald-200/60 rounded-lg px-2 py-1 transition-all focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-500/10">
              <span className="text-[9px] font-bold text-emerald-600 uppercase">Disc</span>
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-emerald-700">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  value={localDiscount}
                  onChange={(e) => setLocalDiscount(e.target.value)}
                  disabled={isSaving}
                  className="w-14 bg-transparent text-xs font-bold text-emerald-700 focus:outline-none text-right disabled:opacity-50 ml-0.5"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Row: Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-3.5 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
              {activePackageId ? "Package Total" : "Menus Total"}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="text-slate-400">{CURRENCY}</span>
              <span>{menusTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-3.5 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Event Fee</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="text-slate-400">{CURRENCY}</span>
              <span>{eventFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-3.5 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Equipment Rent</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="text-slate-400">{CURRENCY}</span>
              <span>{inventoryRentTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>



          <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-3.5 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Staffing Cost</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="text-slate-400">{CURRENCY}</span>
              <span>{totalStaffCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/60 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.1)] rounded-2xl p-3.5 space-y-1.5">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">Advance Paid</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <span className="text-emerald-500">{CURRENCY}</span>
              <span>{advance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Grand Total & Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Grand Total</span>
            <div className="flex items-center gap-2 text-base font-black text-white">
              <span className="text-slate-500">{CURRENCY}</span>
              <span>{liveGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-[#ff6b00] uppercase tracking-widest block mb-1">Balance To Pay</span>
            <div className="flex items-center gap-2 text-lg font-black text-[#ff6b00]">
              <span className="text-orange-400">{CURRENCY}</span>
              <span>{liveBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {ingredientsTotal > 0 && (
          <div className="mt-4 bg-rose-50/30 border border-rose-100/50 rounded-2xl p-3 inline-block">
            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block mb-1">Purchase Cost (Expense)</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <span className="text-rose-400">{CURRENCY}</span>
              <span>{ingredientsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EventCoreStats);
