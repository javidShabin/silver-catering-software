import React from "react";
import { UserCheck, Check } from "lucide-react";
import { getCateringDesignation } from "../utils/cateringUtils";

const EventDutyRoster = ({ event, handleToggleRosterDay }) => {
  if (event.durationInDays <= 1 || !event.assignedStaff || event.assignedStaff.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <UserCheck size={14} className="text-orange-500" />
            Staff Shift & Duty Roster
          </h3>
          <p className="text-[10px] text-slate-400">Designate staff availability day-by-day across this multi-day engagement.</p>
        </div>
      </div>

      <div className="-mx-4 sm:mx-0 overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] px-4 sm:px-0 pb-1">
          <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="py-2.5">Staff Crew</th>
              <th className="py-2.5">Designation</th>
              {Array.from({ length: event.durationInDays }).map((_, i) => (
                <th key={i} className="py-2.5 text-center">Day {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {event.assignedStaff.map((member) => {
              const designation = getCateringDesignation(member);
              const rosterEntry = (event.dutyRoster || []).find(r => (r.staffId?.id || r.staffId?.id || r.staffId) === (member.id));
              const activeDays = rosterEntry ? rosterEntry.days || [] : [];
              
              return (
                <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-800">{member.name}</td>
                  <td className="py-3 text-slate-500 font-medium">{designation}</td>
                  {Array.from({ length: event.durationInDays }).map((_, i) => {
                    const dayNum = i + 1;
                    const isAssigned = activeDays.includes(dayNum);
                    return (
                      <td key={i} className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRosterDay(member.id, dayNum)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border transition-all ${
                            isAssigned 
                              ? "bg-orange-50 text-orange-600 border-orange-200 shadow-sm" 
                              : "bg-white text-slate-300 border-slate-200 hover:border-slate-300 hover:text-slate-500"
                          }`}
                        >
                          {isAssigned ? (
                            <Check size={12} strokeWidth={3} />
                          ) : (
                            <span className="text-[9px] font-bold">{dayNum}</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventDutyRoster);
