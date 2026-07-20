import React from 'react';
import { motion } from 'framer-motion';
import { useCalendar } from './CalendarContext';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from './dateUtils';
import EventCard from './EventCard';

const MonthView = () => {
  const { currentDate, events, setSelectedEvent } = useCalendar();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Previous month days to fill the first week
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const prevDaysToFill = firstDayOfMonth;
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  
  // Fill previous month days
  for (let i = prevDaysToFill - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: year,
      isCurrentMonth: false,
    });
  }
  
  // Fill current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }
  
  // Fill next month days
  const remainingDays = 42 - days.length; // 6 rows of 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: year,
      isCurrentMonth: false,
    });
  }

  const getEventsForDay = (dayObj) => {
    const dayDate = new Date(dayObj.year, dayObj.month, dayObj.day);
    return events.filter(event => isSameDay(new Date(event.start), dayDate));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.01 } }
        }}
        className="flex-1 grid grid-cols-7 gap-px bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/5"
      >
        {days.map((dayObj, index) => {
          const dayEvents = getEventsForDay(dayObj);
          const isToday = isSameDay(new Date(), new Date(dayObj.year, dayObj.month, dayObj.day));
          
          return (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
              className={`min-h-[120px] p-3 bg-white dark:bg-[#0a0a0a] transition-colors group relative ${
                dayObj.isCurrentMonth ? '' : 'opacity-40'
              } hover:bg-gray-50/50 dark:hover:bg-white/[0.02] cursor-pointer`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium ${
                  isToday 
                  ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full shadow-lg shadow-blue-500/30' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}>
                  {dayObj.day}
                </span>
                
                {dayEvents.length > 0 && (
                  <div className="flex -space-x-1">
                    {dayEvents.flatMap(e => e.staff).slice(0, 2).map((staff, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400">
                        {staff.avatar}
                      </div>
                    ))}
                    {dayEvents.flatMap(e => e.staff).length > 2 && (
                      <div className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[8px] font-bold text-gray-400">
                        +{dayEvents.flatMap(e => e.staff).length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 overflow-hidden">
                {dayEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={setSelectedEvent} 
                    variant="month"
                    onDragEnd={(event, info) => {
                      console.log('Moved event:', event.title, info.offset);
                      // In a real app, calculate new date based on offset
                    }}
                  />
                ))}
              </div>

              {/* Hover highlight line */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default MonthView;
