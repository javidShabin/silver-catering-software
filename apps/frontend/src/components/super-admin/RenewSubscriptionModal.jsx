import React, { useState, useEffect } from "react";
import { X, Calendar, CreditCard, RotateCw } from "lucide-react";

const RenewSubscriptionModal = ({ isOpen, onClose, tenant, onRenew, isRenewing }) => {
  const [billingCycle, setBillingCycle] = useState("1_month");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState("");

  useEffect(() => {
    if (tenant && isOpen) {
      // Default to 1_month or the existing cycle if it's not testing
      const defaultCycle = tenant.isTesting ? "1_month" : (tenant.billingCycle || "1_month");
      setBillingCycle(defaultCycle);
    }
  }, [tenant, isOpen]);

  useEffect(() => {
    if (tenant?.plan) {
      let price = 0;
      if (billingCycle === "1_month") price = tenant.plan.price || 0;
      else if (billingCycle === "3_months") price = (tenant.plan.price3Months || 0) * 3;
      else if (billingCycle === "6_months") price = (tenant.plan.price6Months || 0) * 6;
      else if (billingCycle === "1_year") price = (tenant.plan.price1Year >= 0 ? tenant.plan.price1Year : (tenant.plan.price || 0)) * 12;

      // Add custom feature prices multiplied by the billing cycle months
      let customFeaturesMonthlyTotal = 0;
      if (tenant.customFeaturePrices && tenant.customFeatures) {
        for (const feat of tenant.customFeatures) {
          customFeaturesMonthlyTotal += Number(tenant.customFeaturePrices[feat]) || 0;
        }
      }

      let multiplier = 1;
      if (billingCycle === "3_months") multiplier = 3;
      else if (billingCycle === "6_months") multiplier = 6;
      else if (billingCycle === "1_year") multiplier = 12;

      price += customFeaturesMonthlyTotal * multiplier;

      setCalculatedPrice(price >= 0 ? price : 0);

      // Calculate new expiry date based on current date (or existing expiry if it's in the future? Usually renewal starts from today or extends)
      // Let's extend from today for simplicity and fairness in standard saas, or if it's currently active, extend from current expiry.
      const now = new Date();
      let baseDate = now;
      if (tenant.subscriptionExpiresAt) {
        const currentExpiry = new Date(tenant.subscriptionExpiresAt);
        if (currentExpiry > now) {
          baseDate = currentExpiry;
        }
      }

      const newDate = new Date(baseDate);
      if (billingCycle === "1_month") newDate.setMonth(newDate.getMonth() + 1);
      else if (billingCycle === "3_months") newDate.setMonth(newDate.getMonth() + 3);
      else if (billingCycle === "6_months") newDate.setMonth(newDate.getMonth() + 6);
      else if (billingCycle === "1_year") newDate.setFullYear(newDate.getFullYear() + 1);

      setCalculatedExpiryDate(newDate.toISOString().slice(0, 10));
    }
  }, [billingCycle, tenant]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRenew({
      billingCycle,
      subscriptionPrice: calculatedPrice,
      subscriptionExpiresAt: new Date(calculatedExpiryDate).toISOString(),
      status: 'active' // Ensure the tenant is re-activated if they were suspended
    });
  };

  const planName = tenant?.plan?.name || "Unknown Plan";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
            <RotateCw size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Renew Subscription</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company</span>
              <span className="text-sm font-bold text-slate-900">{tenant?.name}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Plan</span>
              <span className="text-sm font-bold text-primary-600">{planName}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Renewal Duration</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-slate-800 bg-white cursor-pointer shadow-sm"
            >
              {tenant?.plan?.price >= 0 && <option value="1_month">1 Month (₹{tenant.plan.price.toLocaleString("en-IN")})</option>}
              {tenant?.plan?.price3Months >= 0 && <option value="3_months">3 Months (₹{(tenant.plan.price3Months * 3).toLocaleString("en-IN")})</option>}
              {tenant?.plan?.price6Months >= 0 && <option value="6_months">6 Months (₹{(tenant.plan.price6Months * 6).toLocaleString("en-IN")})</option>}
              {tenant?.plan?.price1Year >= 0 && <option value="1_year">1 Year (₹{(tenant.plan.price1Year * 12).toLocaleString("en-IN")})</option>}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                <CreditCard size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Price</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">₹{calculatedPrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">New Expiry</span>
              </div>
              <span className="text-sm font-bold text-blue-700 mt-1 block">
                {new Date(calculatedExpiryDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isRenewing}
              className="w-full py-3 text-sm font-bold text-[#ffffff] bg-primary-600 hover:bg-primary-700 rounded-xl transition-all disabled:opacity-60 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {isRenewing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RotateCw size={16} />
                  <span>Confirm Renewal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewSubscriptionModal;
