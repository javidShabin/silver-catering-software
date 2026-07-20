import React from "react";
import { Calendar as CalendarIcon, LayoutGrid, List, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const CalendarHeader = ({ currentDate, view, setView, prevMonth, nextMonth, setCurrentDate, openCreateWithDate }) => {
  const { t } = useTranslation();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 text-center md:text-left">
      <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white shadow-sm">
          <CalendarIcon size={18} />
        </div>
        <div className="text-left">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} - {t("calendar.event_calendar", "Event Calendar")}
          </h1>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">{t("calendar.calendar_subtitle", "Overview of your catering schedule.")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
        <div className="flex bg-slate-100/80 backdrop-blur p-0.5 rounded-lg border border-slate-200/50 shadow-sm">
          <button 
            onClick={() => setView("month")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all ${view === "month" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <LayoutGrid size={12} /> Month
          </button>
          <button 
            onClick={() => setView("week")}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all ${view === "week" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <List size={12} /> Week
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-white border border-slate-200/60 p-0.5 rounded-lg shadow-sm">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-650 transition-all">
            <ChevronLeft size={14} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-[10px] font-black text-slate-605 hover:bg-slate-50 rounded-md transition-all"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-650 transition-all">
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="w-full flex justify-center md:w-auto">
          <button 
            onClick={() => openCreateWithDate(null)}
            className="flex items-center gap-1.5 px-4 py-2 md:px-4 md:py-1.5 text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50 max-md:bg-primary-600 max-md:hover:bg-primary-500 max-md:shadow-primary-500/25"
          >
            <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("calendar.add_event", "Add Event")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
