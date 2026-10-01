import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import DatePicker from "../ui/DatePicker";

const EditTenantModal = ({ isOpen, onClose, tenant, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    contactEmail: "",
    contactPhone: "",
    address: "",
    isTesting: false,
    billingCycle: "",
    subscriptionExpiresAt: "",
    subscriptionPrice: 0
  });

  useEffect(() => {
    if (tenant) {
      const isTestingPlan = tenant.plan?.price3Months === -1;
      setFormData({
        name: tenant.name || "",
        status: tenant.status || "active",
        contactEmail: tenant.contactEmail || "",
        contactPhone: tenant.contactPhone || "",
        address: tenant.address || "",
        isTesting: isTestingPlan,
        billingCycle: tenant.billingCycle || (isTestingPlan ? "1_week" : "1_year"),
        subscriptionExpiresAt: tenant.subscriptionExpiresAt ? tenant.subscriptionExpiresAt.slice(0, 10) : "",
        subscriptionPrice: tenant.subscriptionPrice || 0
      });
    }
  }, [tenant]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave({
      ...formData,
      subscriptionPrice: formData.isTesting ? 0 : Number(formData.subscriptionPrice || 0),
      subscriptionExpiresAt: formData.subscriptionExpiresAt ? new Date(formData.subscriptionExpiresAt).toISOString() : null
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
        >
          <X size={14} />
        </button>

        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-5">Edit Company Details</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-slate-700 bg-slate-50"
              placeholder="e.g. Acme Catering"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-slate-700 bg-slate-50 cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Subscription Settings Container */}
          <div className="p-3.5 bg-primary-50/20 border border-primary-100/25 rounded-2xl space-y-3">
            <span className="block text-[10px] font-extrabold text-primary-650 uppercase tracking-widest">Subscription Settings</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled
                className={`py-1.5 px-2.5 text-[11px] font-bold rounded-lg border transition-all cursor-default ${
                  formData.isTesting
                    ? "bg-primary-650 border-primary-650 text-white shadow-sm"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                }`}
              >
                🧪 Testing / Trial
              </button>
              <button
                type="button"
                disabled
                className={`py-1.5 px-2.5 text-[11px] font-bold rounded-lg border transition-all cursor-default ${
                  !formData.isTesting
                    ? "bg-emerald-655 border-emerald-655 text-white shadow-sm"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                }`}
              >
                💼 Main Plan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className={formData.isTesting ? "col-span-2" : ""}>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Billing Cycle</label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => {
                    const cycle = e.target.value;
                    let price = 0;
                    if (tenant?.plan) {
                      if (formData.isTesting) {
                        price = cycle === "1_day" ? (tenant.plan.price1Day || 0) : (tenant.plan.price1Week || 0);
                      } else {
                        if (cycle === "1_month") price = tenant.plan.price || 0;
                        else if (cycle === "3_months") price = (tenant.plan.price3Months || 0) * 3;
                        else if (cycle === "6_months") price = (tenant.plan.price6Months || 0) * 6;
                        else if (cycle === "1_year") price = (tenant.plan.price1Year >= 0 ? tenant.plan.price1Year : (tenant.plan.price || 0)) * 12;
                      }

                      // Add custom feature prices multiplied by the billing cycle months
                      let customFeaturesMonthlyTotal = 0;
                      if (tenant.customFeaturePrices && tenant.customFeatures) {
                        for (const feat of tenant.customFeatures) {
                          customFeaturesMonthlyTotal += Number(tenant.customFeaturePrices[feat]) || 0;
                        }
                      }
                      
                      let multiplier = 1;
                      if (cycle === "3_months") multiplier = 3;
                      else if (cycle === "6_months") multiplier = 6;
                      else if (cycle === "1_year") multiplier = 12;

                      if (!formData.isTesting) {
                        price += customFeaturesMonthlyTotal * multiplier;
                      }
                    }
                    setFormData({ ...formData, billingCycle: cycle, subscriptionPrice: price >= 0 ? price : 0 });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium text-slate-750 bg-white cursor-pointer font-semibold"
                >
                  {formData.isTesting ? (
                    <>
                      {tenant?.plan?.price1Day >= 0 && <option value="1_day">1 Day (Testing - Free)</option>}
                      {tenant?.plan?.price1Week >= 0 && <option value="1_week">1 Week (Testing - Free)</option>}
                    </>
                  ) : (
                    <>
                      {tenant?.plan?.price >= 0 && <option value="1_month">1 Month (₹{tenant.plan.price.toLocaleString("en-IN")}/mo - Total: ₹{tenant.plan.price.toLocaleString("en-IN")})</option>}
                      {tenant?.plan?.price3Months >= 0 && <option value="3_months">3 Months (₹{tenant.plan.price3Months.toLocaleString("en-IN")}/mo - Total: ₹{(tenant.plan.price3Months * 3).toLocaleString("en-IN")})</option>}
                      {tenant?.plan?.price6Months >= 0 && <option value="6_months">6 Months (₹{tenant.plan.price6Months.toLocaleString("en-IN")}/mo - Total: ₹{(tenant.plan.price6Months * 6).toLocaleString("en-IN")})</option>}
                      {tenant?.plan?.price1Year >= 0 && (
                        <option value="1_year">
                          1 Year (₹{tenant.plan.price1Year.toLocaleString("en-IN")}/mo - Total: ₹{(tenant.plan.price1Year * 12).toLocaleString("en-IN")})
                        </option>
                      )}
                    </>
                  )}
                </select>
              </div>

              {!formData.isTesting && (
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Price (₹)</label>
                  <input
                    type="number"
                    value={formData.subscriptionPrice}
                    onChange={(e) => setFormData({ ...formData, subscriptionPrice: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium text-slate-700 bg-white font-semibold"
                  />
                </div>
              )}
            </div>

            <div>
              <DatePicker
                label="Subscription Expiration Date"
                value={formData.subscriptionExpiresAt}
                onChange={(e) => setFormData({ ...formData, subscriptionExpiresAt: e.target.value })}
                inputClassName="h-[34px] px-2.5 border-slate-205 rounded-lg bg-white text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-slate-700 bg-slate-50"
              placeholder="e.g. info@acme.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-slate-700 bg-slate-50"
              placeholder="e.g. +91 9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-slate-700 bg-slate-50 resize-none"
              placeholder="Enter complete company address"
            />
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
              type="submit"
              disabled={isSaving || !formData.name.trim()}
              className="px-4 py-2 text-sm font-semibold text-[#ffffff] bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTenantModal;
