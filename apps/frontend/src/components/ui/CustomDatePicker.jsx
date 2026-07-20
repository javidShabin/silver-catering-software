import React, { useState, useMemo, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CustomDatePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value + "T12:00:00") : new Date();
  });
  const popoverRef = useRef(null);

  // Sync state if value changes
  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value + "T12:00:00"));
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const gridDays = useMemo(() => {
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const prevMonthDays = daysInMonth(year, month - 1);
    
    const arr = [];
    
    // Trailing days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      arr.push({ day: prevMonthDays - i, isCurrent: false, monthOffset: -1 });
    }
    // Days of current month
    for (let i = 1; i <= days; i++) {
      arr.push({ day: i, isCurrent: true, monthOffset: 0 });
    }
    // Leading days of next month
    const remaining = 42 - arr.length;
    for (let i = 1; i <= remaining; i++) {
      arr.push({ day: i, isCurrent: false, monthOffset: 1 });
    }
    return arr;
  }, [year, month]);

  const handleSelectDay = (dayObj) => {
    const targetDate = new Date(year, month + dayObj.monthOffset, dayObj.day, 12, 0, 0);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Format value for display (e.g. "Jun 2, 2026" or "Select Date")
  const formattedValue = useMemo(() => {
    if (!value) return "Select Date";
    const d = new Date(value + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [value]);

  return (
    <div className="relative flex-1 sm:flex-initial min-w-0" ref={popoverRef}>
      {/* Click Trigger Card */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-3 py-2 bg-white border rounded-xl min-w-0 shadow-sm transition-all cursor-pointer select-none active:scale-[0.98] w-full ${
          value || isOpen
            ? "border-orange-200 hover:border-orange-300 shadow-orange-500/10"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Calendar size={13} className={`shrink-0 transition-colors ${value || isOpen ? "text-orange-500" : "text-slate-400"}`} />
        <div className="flex flex-col text-left min-w-0 flex-1">
          <span className={`text-[8px] font-extrabold uppercase tracking-wider leading-none transition-colors ${value || isOpen ? "text-orange-400" : "text-slate-400"}`}>{label}</span>
          <span className={`text-xs font-bold leading-none mt-1 truncate transition-colors ${value ? "text-orange-600" : (isOpen ? "text-orange-300" : "text-slate-400")}`}>
            {formattedValue}
          </span>
        </div>
      </div>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 left-0 sm:left-auto sm:right-0 w-[280px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-orange-600">
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <span key={d} className="text-[9px] font-black text-orange-300 uppercase tracking-wide">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {gridDays.map((dayObj, idx) => {
                const dayDateStr = `${year}-${String(month + 1 + dayObj.monthOffset).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
                const isSelected = value === dayDateStr;
                const isCurrentMonth = dayObj.monthOffset === 0;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectDay(dayObj)}
                    className={`h-7 w-7 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                        : isCurrentMonth
                          ? "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                          : "text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {dayObj.day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
