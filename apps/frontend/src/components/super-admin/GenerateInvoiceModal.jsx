import React from "react";
import DatePicker from "../ui/DatePicker";

const GenerateInvoiceModal = ({
  isOpen,
  onClose,
  tenant,
  invoiceDueDate,
  setInvoiceDueDate,
  isGeneratingInvoice,
  onGenerate
}) => {
  if (!isOpen) return null;

  // Calculate monthly custom feature pricing
  let customTotal = 0;
  if (tenant.customFeaturePrices && typeof tenant.customFeaturePrices === "object") {
    const enabledCustom = tenant.customFeatures || [];
    for (const [feat, price] of Object.entries(tenant.customFeaturePrices)) {
      if (enabledCustom.includes(feat)) {
        customTotal += Number(price) || 0;
      }
    }
  }

  const cycle = tenant.billingCycle || "1_month";
  let factor = 1;
  if (cycle === "3_months") factor = 3;
  else if (cycle === "6_months") factor = 6;
  else if (cycle === "1_year") factor = 12;

  const basePriceMonthly = Number(tenant.plan?.price || 0);
  const basePriceYearly = Number(tenant.plan?.price1Year >= 0 ? tenant.plan.price1Year : basePriceMonthly);
  const basePriceCalculated = (cycle === "1_year" ? basePriceYearly : basePriceMonthly) * factor;

  const customFeatureCalculated = customTotal * factor;
  const totalPriceCalculated = basePriceCalculated + customFeatureCalculated;

  const displayPeriod = cycle.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-5">Generate Subscription Invoice</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Package</span>
            <span className="text-sm font-bold text-slate-900">{displayPeriod}</span>
          </div>

          <div>
            <DatePicker
              label="Payment Due Date"
              value={invoiceDueDate}
              onChange={(e) => setInvoiceDueDate(e.target.value)}
              inputClassName="h-[42px] px-3.5 border-slate-200 rounded-xl bg-slate-50 text-sm font-medium"
            />
          </div>

          <div className="bg-primary-50/40 p-4 rounded-2xl border border-primary-100/50 text-xs text-primary-950 mt-4 space-y-2.5 font-semibold">
            <div className="flex justify-between">
              <span>Base Subscription:</span>
              <span className="font-bold">₹{basePriceCalculated.toLocaleString("en-IN")}</span>
            </div>
            {customTotal > 0 && (
              <div className="flex justify-between">
                <span>Addon Features:</span>
                <span className="font-bold">+₹{customFeatureCalculated.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="border-t border-primary-200/50 my-2 pt-2 flex justify-between text-primary-600 font-extrabold text-sm">
              <span>Total Due:</span>
              <span>₹{totalPriceCalculated.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGeneratingInvoice || !invoiceDueDate}
            className="px-4 py-2 text-sm font-semibold text-[#ffffff] bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm cursor-pointer"
          >
            {isGeneratingInvoice ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
