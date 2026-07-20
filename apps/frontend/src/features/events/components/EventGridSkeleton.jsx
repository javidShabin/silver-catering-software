import React from 'react';

const EventGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-5 space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="w-20 h-5 bg-slate-100 dark:bg-white/5 rounded-lg" />
            <div className="w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 dark:bg-white/5 rounded-lg" />
            <div className="w-2/3 h-3 bg-slate-50 dark:bg-white/5 rounded-lg" />
          </div>
          <div className="pt-4 border-t border-slate-50 dark:border-white/5 grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-50 dark:bg-white/5 rounded-xl" />
            <div className="h-10 bg-slate-50 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventGridSkeleton;
