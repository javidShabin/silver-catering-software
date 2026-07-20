import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarProvider, useCalendar } from './CalendarContext';
import { formatMonth } from './dateUtils';
import MonthView from './MonthView';
import TimelineView from './TimelineView';
import TimelineWidgets from './TimelineWidgets';
import EventDetailModal from './EventDetailModal';
import PremiumModal from '../ui/PremiumModal';
import CreateEventForm from './CreateEventForm';
import { toast } from 'react-hot-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  LayoutGrid, 
  Columns, 
  List, 
  Search,
  Bell,
  Settings
} from 'lucide-react';

const CalendarHeader = ({ onAddEvent }) => {
  const { currentDate, view, setView, navigateNext, navigatePrev, navigateToday } = useCalendar();

  const views = [
    { id: 'month', icon: LayoutGrid, label: 'Month' },
    { id: 'week', icon: Columns, label: 'Week' },
    { id: 'day', icon: List, label: 'Day' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-white/5 backdrop-blur-xl border-b border-white/10 gap-4">
      <div className="flex items-center justify-between w-full md:w-auto gap-6">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-800 tracking-tight">
          {formatMonth(currentDate)}
        </h2>
        
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1 border border-white/5">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigatePrev}
            className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <motion.button 
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            onClick={navigateToday}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg"
          >
            Today
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateNext}
            className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/50 flex-shrink-0">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === v.id 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <v.icon size={16} />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-white/10 mx-2" />

        <button 
          onClick={onAddEvent}
          className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 group flex-shrink-0"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">Schedule Event</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </div>
  );
};

const CalendarContent = () => {
  const { view } = useCalendar();

  return (
    <div className="flex-1 overflow-hidden relative bg-slate-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full p-4 md:p-8"
        >
          {view === 'month' && <MonthView />}
          {view === 'week' && <TimelineView />}
          {view === 'day' && <TimelineView />} 
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const CalendarSidebar = () => {
  return (
    <div className="w-80 border-l border-slate-200/60 bg-white p-6 hidden xl:block overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-800">Timeline</h3>
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <TimelineWidgets />
      </div>
    </div>
  );
};

const Calendar = () => {
  const { setEvents, events } = useCalendar();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setToast = (data) => { if (!data) return; if (data.type === 'error') toast.error(data.message); else toast.success(data.message); };

  const handleCreateEvent = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Optimistic Update
      const optimisticEvent = {
        id: 'temp-' + Date.now(),
        title: formData.title || 'New Event',
        start: new Date(`${formData.date}T${formData.time}`),
        end: new Date(`${formData.date}T${formData.time}`),
        status: 'pending',
        type: formData.type,
        staff: [{ name: 'You', avatar: 'Y' }],
        location: formData.location || 'Location TBD',
        color: formData.type === 'catering' 
          ? 'bg-blue-400/20 text-blue-400 border-blue-400/30' 
          : formData.type === 'delivery'
            ? 'bg-purple-400/20 text-purple-400 border-purple-400/30'
            : 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30'
      };
      
      setEvents(prev => [...prev, optimisticEvent]);
      setIsQuickAddOpen(false);

      const response = await eventApi.create(formData);
      
      // Replace optimistic event with real one from server
      setEvents(prev => prev.map(e => e.id === optimisticEvent.id ? response : e));
      setToast({ message: "Event created successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to create event:", error);
      // Rollback optimistic update
      setEvents(prev => prev.filter(e => !e.id.toString().startsWith('temp-')));
      setToast({ 
        message: error.response?.data?.message || "Failed to create event.", 
        type: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CalendarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900 selection:bg-primary-500/30">
        <CalendarHeader onAddEvent={() => setIsQuickAddOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <CalendarContent />
          <CalendarSidebar />
        </div>
        <EventDetailModal />
        
        <PremiumModal 
          isOpen={isQuickAddOpen} 
          onClose={() => setIsQuickAddOpen(false)}
          title="New Event"
          description="Schedule a new catering or delivery event"
        >
          <CreateEventForm 
            onSubmit={handleCreateEvent}
            onCancel={() => setIsQuickAddOpen(false)}
            isLoading={isSubmitting}
          />
        </PremiumModal>

        
      </div>
    </CalendarProvider>
  );
};

export default Calendar;
