import React from 'react';
import { motion } from 'framer-motion';
import { useCalendar } from './CalendarContext';
import { Clock, MapPin, Users, CheckCircle2, Timer, AlertCircle } from 'lucide-react';

const TimelineWidgets = () => {
  const { events } = useCalendar();

  const statusIcons = {
    confirmed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    pending: { icon: Timer, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    cancelled: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  };

  return (
    <div className="space-y-8">
      {/* Stats Widget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.filter(e => e.status === 'confirmed').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.filter(e => e.status === 'pending').length}</p>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Upcoming Events</h4>
        <div className="space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10" />

          {events.map((event, index) => {
            const StatusIcon = statusIcons[event.status].icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-10 group"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#0a0a0a] shadow-sm z-10 flex items-center justify-center ${statusIcons[event.status].bg}`}>
                  <StatusIcon size={10} className={statusIcons[event.status].color} />
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all cursor-pointer shadow-sm group-hover:shadow-xl group-hover:shadow-black/5 group-hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors truncate pr-2">
                      {event.title}
                    </h5>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <Clock size={12} className="opacity-60" />
                      {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(event.start))}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <MapPin size={12} className="opacity-60" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-1.5">
                        {event.staff.map((s, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[8px] font-bold text-gray-500">
                            {s.avatar}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-tight">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {events.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No events scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineWidgets;
