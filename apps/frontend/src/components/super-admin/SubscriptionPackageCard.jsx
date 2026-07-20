import React from "react";
import { Landmark, CheckCircle, Info } from "lucide-react";
import { FEATURE_LABELS } from "./constants";

const SubscriptionTimeline = ({ startDate, expiresDate, billingCycle, isTesting }) => {
  const start = new Date(startDate);
  const today = new Date();
  
  // Expiration Date
  const end = expiresDate ? new Date(expiresDate) : null;
  
  let currentStart = new Date(startDate);
  
  if (end && !isTesting && billingCycle) {
    currentStart = new Date(end);
    if (billingCycle === '1_day') currentStart.setDate(currentStart.getDate() - 1);
    else if (billingCycle === '1_week') currentStart.setDate(currentStart.getDate() - 7);
    else if (billingCycle === '1_month') currentStart.setMonth(currentStart.getMonth() - 1);
    else if (billingCycle === '3_months') currentStart.setMonth(currentStart.getMonth() - 3);
    else if (billingCycle === '6_months') currentStart.setMonth(currentStart.getMonth() - 6);
    else if (billingCycle === '1_year') currentStart.setFullYear(currentStart.getFullYear() - 1);
    
    if (currentStart < new Date(startDate)) {
      currentStart = new Date(startDate);
    }
  }

  let totalDays = 1;
  let daysPassed = 0;
  let percentage = 0;
  let daysRemaining = 0;

  if (end) {
    totalDays = Math.round((end - currentStart) / (1000 * 60 * 60 * 24)) || 1;
    daysPassed = Math.round((today - currentStart) / (1000 * 60 * 60 * 24));
    if (daysPassed < 0) daysPassed = 0;
    if (daysPassed > totalDays) daysPassed = totalDays;
    percentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    daysRemaining = Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24)));
  }

  const cycleLabel = billingCycle ? billingCycle.replace("_", " ") : "1 Year";

  return (
    <div className="mt-3 pt-3 border-t border-slate-50">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
        <span className="capitalize">
          Timeline ({isTesting ? "Testing - " : ""}{cycleLabel})
        </span>
        {end && <span>{percentage.toFixed(0)}%</span>}
      </div>
      
      {end && (
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-450 font-bold">
        <span>{start.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
        {end ? (
          <span className={today > end ? "text-red-600" : "text-indigo-600"}>
            {today > end ? "Expired" : `${daysRemaining} days left`}
          </span>
        ) : (
          <span className="text-slate-400">No Expiration Date</span>
        )}
      </div>
    </div>
  );
};

const SubscriptionPackageCard = ({ tenant, onRenewClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/40">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subscription Package</h3>
      </div>
      <div className="p-4 flex flex-col">
        {tenant.plan ? (
          <div className="flex flex-col">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Landmark className="text-indigo-600" size={16} />
                  <span className="text-sm font-bold text-slate-900">{tenant.plan.name}</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg capitalize">
                  {(() => {
                    const price = tenant.subscriptionPrice ?? tenant.plan.price;
                    return price > 0
                      ? `₹${price.toLocaleString("en-IN")} / ${tenant.billingCycle ? tenant.billingCycle.replace("_", " ") : "mo"}`
                      : "Free";
                  })()}
                </span>
              </div>

              <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Features Included</p>
                <div className="max-h-[130px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                  {tenant.plan.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-650">
                      <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                      {FEATURE_LABELS[feature] || feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 shrink-0">
              <SubscriptionTimeline 
                startDate={tenant.createdAt} 
                expiresDate={tenant.subscriptionExpiresAt} 
                billingCycle={tenant.billingCycle}
                isTesting={tenant.isTesting}
              />
              {!tenant.isTesting && onRenewClick && (
                <button
                  onClick={onRenewClick}
                  className="w-full mt-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Landmark size={14} />
                  Renew Subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-3 flex items-center gap-1.5 flex-1 items-center justify-center">
            <Info size={14} /> No active subscription plan assigned.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPackageCard;
