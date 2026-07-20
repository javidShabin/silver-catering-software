import React, { useMemo, useState, useEffect } from "react";
import { Plus, Eye, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CalendarGrid = ({ currentDate, events, openCreateWithDate, popoverDate, setPopoverDate }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuDate, setMobileMenuDate] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach(e => {
      if (!e.date) return;
      const start = new Date(e.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + (e.durationInDays || 1) - 1);
      end.setHours(23, 59, 59, 999);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr).push(e);
      }
    });
    return map;
  }, [events]);

  const days = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const prevMonthDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);
  
  const calendarDays = [];
  
  // Previous month's trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, currentMonth: false });
  }
  
  // Current month's days
  for (let i = 1; i <= days; i++) {
    calendarDays.push({ day: i, currentMonth: true });
  }
  
  // Next month's leading days
  const remainingSlots = 42 - calendarDays.length;
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({ day: i, currentMonth: false });
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-330px)] min-h-[460px] relative">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        {dayNames.map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>
      <div 
        className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto custom-scrollbar" 
        style={{ gridTemplateRows: `repeat(6, minmax(${isMobile ? '50px' : '85px'}, 1fr))` }}
      >
        {calendarDays.map((dateObj, idx) => {
          const isToday = dateObj.currentMonth && 
                          dateObj.day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear();
          
          const dayDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;
          const dayEvents = dateObj.currentMonth ? (eventsByDate.get(dayDate) || []) : [];
          const isPast = dateObj.currentMonth && new Date(`${dayDate}T00:00:00`) < new Date(new Date().setHours(0,0,0,0));

          return (
            <div 
              key={idx} 
              onClick={() => {
                if (!dateObj.currentMonth) return;
                if (isMobile) {
                  setMobileMenuDate({ dateStr: dayDate, hasEvents: dayEvents.length > 0, isPast });
                } else {
                  if (dayEvents.length > 0) {
                    setPopoverDate(dayDate);
                  } else {
                    if (!isPast) openCreateWithDate(dayDate);
                  }
                }
              }}
              className={`p-1 sm:p-2 border-r border-b border-slate-100/60 transition-all group relative flex flex-col items-center justify-center cursor-pointer min-h-0 ${
                !dateObj.currentMonth ? "bg-slate-50/30 opacity-40 select-none pointer-events-none" : "hover:bg-primary-50/5"
              }`}
            >
              <div className="absolute top-1 sm:top-1.5 left-1.5 sm:left-2">
                <span className={`text-[10px] sm:text-xs font-black ${
                  !dateObj.currentMonth ? "text-slate-300" : isToday ? "w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-tr from-primary-600 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-md shadow-primary-500/20" : "text-slate-600"
                }`}>
                  {dateObj.day}
                </span>
              </div>

              {dayEvents.length > 0 && dateObj.currentMonth && (
                <div className="absolute top-1 sm:top-2.5 right-1 sm:right-2.5">
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full block ${
                     dayEvents.some(e => e.status === 'pending') ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse' : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse'
                  }`} />
                </div>
              )}

              {dateObj.currentMonth && (
                <div className="hidden lg:flex opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 items-center gap-1.5 sm:gap-2">
                  {!isPast && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); openCreateWithDate(dayDate); }}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                      title="Add Event"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  {dayEvents.length > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPopoverDate(dayDate); }}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                      title="View Events"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Actions Popup / Menu */}
      <AnimatePresence>
        {isMobile && mobileMenuDate && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuDate(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Bottom Actions Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl z-10 border border-slate-100 flex flex-col gap-6"
            >
              {/* Drag Handle to look native */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-1" />

              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-50 text-primary-700 uppercase tracking-wider">
                    {new Date(mobileMenuDate.dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-1">
                    {new Date(mobileMenuDate.dateStr + "T12:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                </div>
                <button
                  onClick={() => setMobileMenuDate(null)}
                  className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-150 text-slate-400 hover:text-slate-650 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Actions List (Stacked for premium mobile UX) */}
              <div className="space-y-3">
                {/* Add Event Action */}
                {!mobileMenuDate.isPast && (
                  <button
                    onClick={() => {
                      openCreateWithDate(mobileMenuDate.dateStr);
                      setMobileMenuDate(null);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-primary-50/10 hover:to-white border border-slate-200/60 hover:border-primary-200/50 rounded-2xl transition-all cursor-pointer group active:scale-[0.98] text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:bg-primary-600 transition-colors shrink-0">
                        <Plus size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 group-hover:text-primary-700 transition-colors">Plan New Event</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Schedule catering details & menu</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-350 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </button>
                )}

                {/* View Events Action */}
                <button
                  onClick={() => {
                    if (mobileMenuDate.hasEvents) {
                      setPopoverDate(mobileMenuDate.dateStr);
                      setMobileMenuDate(null);
                    }
                  }}
                  disabled={!mobileMenuDate.hasEvents}
                  className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all text-left group ${
                    mobileMenuDate.hasEvents
                      ? "bg-gradient-to-r from-slate-50 to-white hover:from-primary-50/10 hover:to-white border-slate-200/60 hover:border-primary-200/50 cursor-pointer active:scale-[0.98]"
                      : "bg-slate-50/30 border-slate-100 opacity-45 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-colors shrink-0 ${
                      mobileMenuDate.hasEvents
                        ? "bg-primary-600 text-white shadow-primary-500/10 group-hover:bg-indigo-600"
                        : "bg-slate-200 text-slate-400"
                    }`}>
                      <Eye size={20} />
                    </div>
                    <div>
                      <p className={`text-xs font-black transition-colors ${
                        mobileMenuDate.hasEvents ? "text-slate-800 group-hover:text-primary-700" : "text-slate-400"
                      }`}>View Bookings</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {mobileMenuDate.hasEvents ? "Check scheduled catering bookings" : "No engagements scheduled"}
                      </p>
                    </div>
                  </div>
                  {mobileMenuDate.hasEvents && (
                    <ArrowRight size={14} className="text-slate-355 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarGrid;
