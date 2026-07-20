import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MoreHorizontal, Edit2, Trash2, Copy, ExternalLink } from 'lucide-react';

const EventCard = ({ event, onClick, variant = 'month', onDragEnd }) => {
  const isCompact = variant === 'month';
  const constraintsRef = useRef(null);

  return (
    <motion.div
      layoutId={`event-${event.id}`}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragEnd={(e, info) => {
        if (onDragEnd) onDragEnd(event, info);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative group cursor-pointer border rounded-xl transition-all duration-300
        ${event.color}
        ${isCompact ? 'px-2 py-1.5 text-[11px]' : 'p-3 text-[12px]'}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold truncate pr-4">{event.title}</span>
        
        {/* Quick Actions (Appear on hover) */}
        {!isCompact && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-white/20 rounded-md transition-colors">
              <Edit2 size={12} />
            </button>
            <button className="p-1 hover:bg-white/20 rounded-md transition-colors text-rose-500">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {!isCompact && (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 opacity-70">
            <ExternalLink size={10} />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-1">
              {event.staff.map((s, i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-[8px]">
                  {s.avatar}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="text-[9px] uppercase font-bold tracking-tighter">{event.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none rounded-xl" />
      
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ring-2 ring-white/20 ring-inset pointer-events-none" />
    </motion.div>
  );
};

export default EventCard;
