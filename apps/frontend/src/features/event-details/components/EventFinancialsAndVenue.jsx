import { CURRENCY } from "../../../config/currency";
import React from "react";
import { Plus, Trash2, MapPin } from "lucide-react";

const EventFinancialsAndVenue = ({ event, isSaving, setIsExtraBillModalOpen, handleDeleteExtraBill }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50 mt-auto items-stretch">
      {/* Extra Bills Section */}
      <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block">Extra Food & Charges</span>
          <button 
            onClick={() => setIsExtraBillModalOpen(true)}
            className="flex items-center gap-1 text-[10px] font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors border border-primary-100/50"
          >
            <Plus size={12} /> Add Extra Food/Bill
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-start">
          {(!event.extraBills || event.extraBills.length === 0) ? (
            <p className="text-[10px] text-slate-400 italic bg-slate-50/50 p-4 rounded-xl text-center border border-slate-100/50 h-full flex items-center justify-center">No extra bills recorded yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-[40px] overflow-y-auto pr-1 custom-scrollbar">
              {event.extraBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-2 bg-slate-50/80 border border-slate-100 rounded-xl group hover:bg-slate-100/80 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 truncate flex-1 min-w-0 mr-2">{bill.description}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900">{CURRENCY}{Number(bill.amount).toLocaleString("en-IN")}</span>
                    <button 
                      onClick={() => handleDeleteExtraBill(bill.id)}
                      disabled={isSaving}
                      className="text-slate-300 hover:text-rose-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Venue / Location Details */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-start">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Scheduled Venue</span>
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-800">{event.location}</p>
            <p className="text-[10px] text-slate-400">Please verify logistical access for heavy catering equipment 24 hours prior.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventFinancialsAndVenue);
