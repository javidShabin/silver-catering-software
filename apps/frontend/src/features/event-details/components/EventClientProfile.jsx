import React from "react";
import { User, Mail, Phone } from "lucide-react";

const EventClientProfile = ({ event }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">Client Profile</h3>
      {event.customer ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100/30">
              <User size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">{event.customer.name}</h4>
              <p className="text-[10px] text-slate-400">Assigned Catering Client</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-slate-400" />
              <span className="truncate">{event.customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-slate-400" />
              <span>{event.customer.phone || "No phone registered"}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-100 text-center text-xs text-slate-400">
          No customer profile linked to this event.
        </div>
      )}
    </div>
  );
};

export default React.memo(EventClientProfile);
