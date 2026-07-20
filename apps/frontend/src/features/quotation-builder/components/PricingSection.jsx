import React from "react";
import { CURRENCY } from "../../../config/currency";

const PricingSection = ({
  isViewMode,
  taxPercent,
  discountAmount,
  totals,
  onTaxPercentChange,
  onDiscountAmountChange
}) => {
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
              disabled={isViewMode}
              value={taxPercent}
              onChange={(e) => onTaxPercentChange(Number(e.target.value) || 0)}
              className="w-6 bg-transparent outline-none text-right text-[10px] text-white"
            />
            <span className="text-[9px] ml-0.5 text-slate-400">%</span>
          </div>
        </div>
        <span className="font-medium text-white">{CURRENCY}{totals.tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-300 pb-1.5 border-b border-slate-700/50">
        <span>Discount</span>
        <div className="bg-slate-800 rounded px-1 py-0.5 border border-slate-700 flex items-center">
          <span className="text-[9px] mr-1 text-slate-400">{CURRENCY}</span>
          <input 
            type="number"
            disabled={isViewMode}
            value={discountAmount}
            onChange={(e) => onDiscountAmountChange(Number(e.target.value) || 0)}
            className="w-12 bg-transparent outline-none text-right text-[10px] text-white"
          />
        </div>
      </div>

      <div className="flex justify-between items-end pt-0.5">
        <span className="text-[9px] font-bold tracking-widest text-primary-400 uppercase mb-0.5">Grand Total</span>
        <span className="text-xl font-black tracking-tight text-white">{CURRENCY}{totals.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Memoize the component for performance if props remain stable
export default React.memo(PricingSection);
