import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  MoreVertical, 
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  RefreshCw
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';

const EventManagementCard = React.memo(({ event, onEdit, onDelete, onView, onStatusUpdate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0);
  
  const isOverdue = eventDate < today && !["completed", "cancelled"].includes(event.status?.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white rounded-[20px] border ${isOverdue ? 'border-red-200' : 'border-slate-100'} p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300`}
    >
      {isOverdue && (
        <span className="absolute -top-2 -right-2 flex h-4 w-4 z-20" title="This event is overdue and not completed">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      )}
      {/* Quick Actions (Absolute top right) */}
      <div className="absolute top-5 right-5 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={() => onStatusUpdate(event)}
          className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-[#ff6b00] hover:bg-[#ff6b00]/5 transition-colors"
          title="Update Status"
        >
          <RefreshCw size={12} />
        </button>
        <button 
          onClick={() => onDelete(event)}
          className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          title="Remove Event"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Header Badge */}
      <div className="mb-4">
        <Badge status={event.status} />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
            {event.title}
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400" />
            {event.location}
          </p>
        </div>

        <div className="h-px w-full bg-slate-50" />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <Calendar size={14} className="text-slate-400" />
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guests</p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <Users size={14} className="text-slate-400" />
              {event.guestCount || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[11px] font-bold text-slate-500">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <button 
            onClick={() => onView(event)}
            className="flex items-center gap-1 text-[13px] font-bold text-[#ff6b00] hover:text-[#e66000] transition-colors"
          >
            Details <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Hover Background Accent */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-primary-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
    </motion.div>
  );
});

const ChevronRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default EventManagementCard;
