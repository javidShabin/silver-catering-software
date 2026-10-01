import React from "react";
import { CURRENCY } from "../../../config/currency";
import { AlertCircle } from "lucide-react";

const PricingSection = ({
  isViewMode,
  taxPercent,
  discountAmount,
  totals,
  onTaxPercentChange,
  onDiscountAmountChange
}) => {
  const numericDiscount = Number(discountAmount || 0);
  const maxAllowedDiscount = (totals.subtotal || 0) + (totals.tax || 0);
  const isDiscountExceeded = numericDiscount > maxAllowedDiscount;
  const isDiscountNegative = numericDiscount < 0;

  return (
    <div className="w-full lg:w-[280px] shrink-0 rounded-lg bg-slate-900 p-3 text-white shadow-lg space-y-2">
      <div className="flex justify-between items-center text-[11px] text-slate-300">
        <span>Subtotal</span>
        <span className="font-medium text-white">{CURRENCY}{totals.subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between items-center text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span>Tax</span>
          <div className="bg-slate-800 rounded px-1 py-0.5 border border-slate-700 flex items-center">
            <input 
              type="number"
              disabled={true}
              value={taxPercent}
              className="w-6 bg-transparent outline-none text-right text-[10px] text-slate-400 cursor-not-allowed"
              title="Tax rate can only be edited in Settings"
            />
            <span className="text-[9px] ml-0.5 text-slate-400">%</span>
          </div>
        </div>
        <span className="font-medium text-white">{CURRENCY}{totals.tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-300 pb-1.5 border-b border-slate-700/50">
        <span>Discount</span>
        <div className={`rounded px-1.5 py-0.5 border flex items-center transition-colors ${
          isDiscountExceeded || isDiscountNegative
            ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500/50' 
            : 'bg-slate-800 border-slate-700'
        }`}>
          <span className={`text-[9px] mr-1 ${isDiscountExceeded || isDiscountNegative ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>{CURRENCY}</span>
          <input 
            type="number"
            min="0"
            max={maxAllowedDiscount}
            disabled={isViewMode}
            value={discountAmount !== undefined && discountAmount !== null ? discountAmount : ""}
            onChange={(e) => onDiscountAmountChange(e.target.value === "" ? "" : Number(e.target.value))}
            className={`w-14 bg-transparent outline-none text-right text-[10px] ${
              isDiscountExceeded || isDiscountNegative ? 'text-rose-300 font-bold' : 'text-white'
            }`}
          />
        </div>
      </div>

      {isDiscountExceeded && (
        <div className="flex items-start gap-1.5 p-1.5 bg-rose-950/70 border border-rose-500/80 rounded text-[10px] text-rose-200 font-medium leading-snug animate-in fade-in">
          <AlertCircle size={12} className="shrink-0 text-rose-400 mt-0.5" />
          <span>Discount cannot exceed total amount ({CURRENCY}{maxAllowedDiscount.toFixed(2)})</span>
        </div>
      )}

      {isDiscountNegative && (
        <div className="flex items-start gap-1.5 p-1.5 bg-rose-950/70 border border-rose-500/80 rounded text-[10px] text-rose-200 font-medium leading-snug animate-in fade-in">
          <AlertCircle size={12} className="shrink-0 text-rose-400 mt-0.5" />
          <span>Discount cannot be negative</span>
        </div>
      )}

      <div className="flex justify-between items-end pt-0.5">
        <span className="text-[9px] font-bold tracking-widest text-primary-400 uppercase mb-0.5">Grand Total</span>
        <span className="text-xl font-black tracking-tight text-white">{CURRENCY}{totals.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default React.memo(PricingSection);
