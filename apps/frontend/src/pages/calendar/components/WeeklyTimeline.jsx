import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const WeeklyTimeline = ({ currentDate, events, onEventClick }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto flex flex-col h-[calc(100vh-220px)]">
      <div className="min-w-[700px] lg:min-w-0 flex-1 flex flex-col">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <div className="w-20 border-r border-slate-100 py-4 flex items-center justify-center">
            <Clock size={16} className="text-slate-400" />
          </div>
          {days.map((day, i) => (
            <div key={i} className="flex-1 py-4 text-center border-r border-slate-100 last:border-r-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p className={`text-sm font-black mt-0.5 ${day.toDateString() === new Date().toDateString() ? 'text-primary-600' : 'text-slate-700'}`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
          <div className="flex min-h-full">
            <div className="w-20 bg-slate-50/30 border-r border-slate-100 shrink-0">
              {hours.map(hour => (
                <div key={hour} className="h-20 border-b border-slate-100 last:border-b-0 px-3 py-2 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 grid grid-cols-7 relative">
              {days.map((day, dayIdx) => {
                const dayStr = day.toISOString().split('T')[0];
                const dayEvents = events.filter(e => e.date?.split('T')[0] === dayStr);

                return (
                  <div key={dayIdx} className="border-r border-slate-100 last:border-r-0 relative min-h-full">
                    {hours.map(hour => (
                      <div key={hour} className="h-20 border-b border-slate-100 last:border-b-0" />
                    ))}

                    {dayEvents.map(event => {
                      // Simple parsing for "HH:MM"
                      const [h, m] = event.time?.split(':').map(Number) || [12, 0];
                      const top = (h - 8) * 80 + (m / 60) * 80;
                      
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => onEventClick(event)}
                          className={`absolute left-1 right-1 p-2 rounded-xl text-[10px] font-bold shadow-sm cursor-pointer z-10 transition-all hover:scale-[1.02] active:scale-95 border ${
                            event.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            event.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}
                          style={{ top: `${top}px`, height: '60px' }}
                        >
                          <div className="truncate">{event.time}</div>
                          <div className="truncate mt-0.5">{event.title}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimeline;
