import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendar } from './CalendarContext';
import { X, Calendar as CalendarIcon, Clock, MapPin, Tag, Users, Check } from 'lucide-react';
import DatePicker from '../ui/DatePicker';

const QuickAddModal = ({ isOpen, onClose }) => {
  const { setEvents } = useCalendar();
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    location: '',
    type: 'catering'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title || 'New Event',
      start: new Date(`${formData.date}T${formData.time}`),
      end: new Date(`${formData.date}T${formData.time}`),
      status: 'pending',
      type: formData.type,
      staff: [{ name: 'You', avatar: 'Y' }],
      location: formData.location || 'Location TBD',
      color: formData.type === 'catering' ? 'bg-blue-400/20 text-blue-400 border-blue-400/30' : 'bg-purple-400/20 text-purple-400 border-purple-400/30'
    };
    
    setEvents(prev => [...prev, newEvent]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Schedule</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Event Title</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. CEO Dinner Catering"
                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <DatePicker
                      label="Date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      inputClassName="h-14 pl-10 bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5 rounded-2xl text-sm"
                      leftIcon={CalendarIcon}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Time</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl pl-10 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={formData.time}
                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Location</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Venue or address"
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl pl-10 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    Create Event
                    <Check size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickAddModal;
