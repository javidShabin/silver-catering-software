import React from "react";
import { Loader2, Save } from "lucide-react";
import { FEATURE_LABELS } from "./constants";

const AddOnModulesCard = ({ 
  tenant, 
  allFeatures, 
  selectedFeatures, 
  setSelectedFeatures, 
  featurePrices, 
  setFeaturePrices, 
  isUpdatingFeatures, 
  onSave 
}) => {
  return (
    <div className="mt-4 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="px-4.5 py-3 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add-on Modules</h3>
        <span className="bg-primary-50 text-primary-755 py-0.5 px-2 rounded-full text-[10px] font-bold border border-primary-100">
          {selectedFeatures.length} Enabled
        </span>
      </div>
      
      <div className="p-4.5 space-y-3.5">
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Activate modular client capabilities outside the standard tier plan. Included bundle elements are disabled.
        </p>

        {/* Simple Grid of Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allFeatures?.map((feature) => {
            const isPlanFeature = tenant.plan?.features?.includes(feature);
            const isChecked = isPlanFeature || selectedFeatures.includes(feature);
            
            return (
              <div 
                key={feature}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold transition-all ${
                  isPlanFeature 
                    ? "bg-slate-50/60 border-slate-100 text-slate-400" 
                    : isChecked 
                      ? "bg-primary-50/20 border-primary-100 text-slate-900 shadow-sm" 
                      : "bg-white border-slate-100 text-slate-700 hover:border-slate-200"
                }`}
              >
                <label className={`flex items-center gap-2 flex-1 ${isPlanFeature ? "cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    disabled={isPlanFeature}
                    checked={isChecked}
                    onChange={() => {
                      if (!isPlanFeature) {
                        setSelectedFeatures(prev => 
                          prev.includes(feature) 
                            ? prev.filter(f => f !== feature) 
                            : [...prev, feature]
                        );
                      }
                    }}
                    className="w-3.5 h-3.5 text-primary-655 bg-slate-100 border-slate-200 rounded focus:ring-primary-500 disabled:opacity-50 cursor-pointer"
                  />
                  <span>{FEATURE_LABELS[feature] || feature}</span>
                </label>

                <div className="flex items-center shrink-0">
                  {isPlanFeature ? (
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Bundle
                    </span>
                  ) : isChecked ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={featurePrices[feature] !== undefined ? featurePrices[feature] : ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setFeaturePrices(prev => ({ ...prev, [feature]: val }));
                        }}
                        className="w-14 px-1 py-0.5 border border-slate-200 rounded-lg text-center font-bold text-slate-755 focus:outline-none focus:ring-1 focus:ring-primary-500 text-[11px]"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save add-ons CTA */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-105">
          <button
            onClick={onSave}
            disabled={isUpdatingFeatures}
            className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all disabled:opacity-60 shadow-sm cursor-pointer"
          >
            {isUpdatingFeatures ? (
              <><Loader2 size={12} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={12} /> Save Modules</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOnModulesCard;
