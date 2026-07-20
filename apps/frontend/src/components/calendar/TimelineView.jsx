import React from 'react';
import { motion } from 'framer-motion';
import { useCalendar } from './CalendarContext';
import { getWeekDays, isSameDay } from './dateUtils';
import EventCard from './EventCard';

const TimelineView = () => {
  const { currentDate, events, setSelectedEvent } = useCalendar();
  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDayAndHour = (date, hour) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, date) && eventStart.getHours() === hour;
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5">
      {/* Timeline Header */}
      <div className="flex border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-md sticky top-0 z-10">
        <div className="w-20 border-r border-gray-200 dark:border-white/5" />
        {weekDays.map((day, i) => (
          <div key={i} className="flex-1 py-4 text-center border-r border-gray-200 dark:border-white/5 last:border-r-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day)}
            </p>
            <p className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}>
              {day.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex min-h-full">
          {/* Time Labels */}
          <div className="w-20 flex-shrink-0 border-r border-gray-200 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-200 dark:border-white/5 flex items-start justify-center pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          {weekDays.map((day, i) => (
            <div key={i} className="flex-1 border-r border-gray-200 dark:border-white/5 last:border-r-0 relative group">
              {hours.map(hour => (
                <div key={hour} className="h-20 border-b border-gray-100 dark:border-white/[0.02] relative hover:bg-blue-500/[0.02] transition-colors">
                  {getEventsForDayAndHour(day, hour).map(event => (
                    <div key={event.id} className="absolute inset-x-1 top-1 bottom-1">
                      <EventCard 
                        event={event} 
                        onClick={setSelectedEvent} 
                        variant="timeline"
                        onDragEnd={(event, info) => {
                          console.log('Moved event in timeline:', event.title, info.offset);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Current time indicator */}
              {isSameDay(day, new Date()) && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                  style={{ top: `${(new Date().getHours() * 80) + (new Date().getMinutes() / 60 * 80)}px` }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
