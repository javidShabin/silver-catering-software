import React from "react";
import { ArrowLeft, Building2, Calendar, Mail, Phone, MapPin, Edit2 } from "lucide-react";

const TenantHeader = ({ tenant, isTrial, monthlyRate, onBack, onEdit }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4.5 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Navigation & Title row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-500 animate-in fade-in duration-300 cursor-pointer"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm">
            <Building2 size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">{tenant.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                tenant.status === "active" ? "bg-green-50 text-green-700 border border-green-150" : "bg-red-50 text-red-700 border border-red-150"
              }`}>
                {tenant.status}
              </span>
              <button 
                onClick={onEdit}
                className="p-1 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 hover:text-indigo-650 transition-all text-slate-400 cursor-pointer flex items-center justify-center"
                title="Edit Company Details"
              >
                <Edit2 size={11} />
              </button>
              {isTrial && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-150 animate-pulse">
                  Trial
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-450 mt-0.5 flex items-center gap-1 font-semibold">
              <Calendar size={12} className="text-indigo-500" /> 
              Registered {new Date(tenant.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Quick Subscription Card header block */}
        {tenant.plan && (
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-3 md:w-72 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Subscription Summary</span>
              <span className="text-[10px] font-bold text-white bg-indigo-500/30 px-2 py-0.5 rounded-md">{tenant.plan.name}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] text-slate-300 font-medium block">Monthly Total</span>
                <span className="text-base font-extrabold text-white">₹{monthlyRate.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-right border-l border-indigo-800 pl-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Projected Yearly</span>
                <span className="text-xs font-bold text-indigo-300">₹{(monthlyRate * 12).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
        <div className="flex items-start gap-2.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 min-w-0">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <Mail size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Email</p>
            <span className="font-semibold text-slate-700 break-all block mt-0.5 text-xs">{tenant.contactEmail || "No email"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 min-w-0">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <Phone size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Phone</p>
            <span className="font-semibold text-slate-700 block mt-0.5 text-xs">{tenant.contactPhone || "No phone"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 min-w-0">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <MapPin size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Company Address</p>
            <span className="font-semibold text-slate-700 leading-normal block break-words whitespace-normal mt-0.5 text-xs" title={tenant.address || "No address"}>
              {tenant.address || "No address"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantHeader;
