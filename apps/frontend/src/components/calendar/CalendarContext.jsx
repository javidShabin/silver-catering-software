import React, { createContext, useContext, useState, useMemo } from 'react';

const CalendarContext = createContext(null);

export const CalendarProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Grand Wedding Catering',
      start: new Date(new Date().setHours(10, 0)),
      end: new Date(new Date().setHours(14, 0)),
      status: 'confirmed',
      type: 'catering',
      staff: [{ name: 'Alex', avatar: 'A' }, { name: 'Sarah', avatar: 'S' }],
      location: 'The Ritz-Carlton',
      client: 'Johnson Wedding',
      color: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
    },
    {
      id: '2',
      title: 'Corporate Lunch Buffet',
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      status: 'pending',
      type: 'delivery',
      staff: [{ name: 'Mike', avatar: 'M' }],
      location: 'Tech Hub HQ',
      client: 'Vercel Inc.',
      color: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
    }
  ]);

  const navigateNext = () => {
    const next = new Date(currentDate);
    if (view === 'month') next.setMonth(next.getMonth() + 1);
    else if (view === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const navigatePrev = () => {
    const prev = new Date(currentDate);
    if (view === 'month') prev.setMonth(prev.getMonth() - 1);
    else if (view === 'week') prev.setDate(prev.getDate() - 7);
    else prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const value = useMemo(() => ({
    currentDate,
    setCurrentDate,
    view,
    setView,
    events,
    setEvents,
    selectedEvent,
    setSelectedEvent,
    navigateNext,
    navigatePrev,
    navigateToday,
  }), [currentDate, view, events, selectedEvent]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
