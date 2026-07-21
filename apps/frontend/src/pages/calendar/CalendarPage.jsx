import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { toast } from 'react-hot-toast';

import { eventApi } from "../../api/eventApi";
import PremiumModal from "../../components/ui/PremiumModal";
import CreateEventForm from "../../components/calendar/CreateEventForm";

// Extracted Components
import DateEventsModal from "./components/DateEventsModal";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import DashboardStats from "./components/DashboardStats";
import EventDetailsPanel from "./components/EventDetailsPanel";
import UpcomingAgenda from "./components/UpcomingAgenda";
import WeeklyTimeline from "./components/WeeklyTimeline";

const CalendarPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("month"); // month, week
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState(null);
  const setToast = useCallback((data) => { 
    if (!data) return; 
    if (data.type === 'error') toast.error(data.message); 
    else toast.success(data.message); 
  }, []);

  const [popoverDate, setPopoverDate] = useState(null); // "YYYY-MM-DD" or null

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await eventApi.getAll({ limit: 100 });
      return res.data;
    }
  });

  const events = eventsData || [];

  const createEventMutation = useMutation({
    mutationFn: (formData) => eventApi.create(formData),
    onSuccess: () => {
      setToast({ message: "Event scheduled successfully!", type: "success" });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      setToast({ message: "Failed to schedule event", type: "error" });
    }
  });

  const handleCreateEvent = useCallback((formData) => {
    createEventMutation.mutate(formData);
  }, [createEventMutation]);
  const isSubmitting = createEventMutation.isPending;

  const openCreateWithDate = useCallback((date) => {
    if (date) {
      const selected = new Date(`${date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setToast({ message: "Cannot schedule events in the past", type: "error" });
        return;
      }
    }
    setPrefilledDate(date);
    setIsCreateModalOpen(true);
  }, []);

  const prevMonth = useCallback(() => {
    if (view === "month") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setCurrentDate(prev => {
        const prevWeek = new Date(prev);
        prevWeek.setDate(prev.getDate() - 7);
        return prevWeek;
      });
    }
  }, [view]);

  const nextMonth = useCallback(() => {
    if (view === "month") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setCurrentDate(prev => {
        const nextWeek = new Date(prev);
        nextWeek.setDate(prev.getDate() + 7);
        return nextWeek;
      });
    }
  }, [view]);

  // Dashboard Stats Calculations
  const { totalEvents, confirmedEvents, pendingEvents } = useMemo(() => ({
    totalEvents: events.length,
    confirmedEvents: events.filter(e => e.status === "confirmed").length,
    pendingEvents: events.filter(e => e.status === "pending").length
  }), [events]);

  // Chronological Upcoming Events list
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(e => {
        const eventDate = new Date(e.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [events]);

  const popoverEvents = useMemo(() => {
    if (!popoverDate) return [];
    return events.filter(e => {
      if (!e.date) return false;
      const start = new Date(e.date); start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(start.getDate() + (e.durationInDays || 1) - 1); end.setHours(23,59,59,999);
      const selectedDate = new Date(popoverDate + "T12:00:00");
      return selectedDate >= start && selectedDate <= end;
    });
  }, [events, popoverDate]);

  return (
    <div className="pb-4 max-w-full mx-auto px-4 sm:px-8">
      
      {/* Top Header */}
      <CalendarHeader 
        currentDate={currentDate}
        view={view}
        setView={setView}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        setCurrentDate={setCurrentDate}
        openCreateWithDate={openCreateWithDate}
      />

      {/* Dashboard Mini-Cards */}
      <DashboardStats 
        totalEvents={totalEvents}
        confirmedEvents={confirmedEvents}
        pendingEvents={pendingEvents}
      />

      {/* Main Double-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        
        {/* Left Column (Calendar grid / timeline) */}
        <div className="lg:col-span-7">
          {view === "month" ? (
            <CalendarGrid 
              currentDate={currentDate}
              events={events}
              openCreateWithDate={openCreateWithDate}
              popoverDate={popoverDate}
              setPopoverDate={setPopoverDate}
            />
          ) : (
            <WeeklyTimeline 
              currentDate={currentDate} 
              events={events} 
              onEventClick={setSelectedEvent} 
            />
          )}
        </div>

        {/* Right Column (Side Agenda / Live details) */}
        <div className="lg:col-span-3">
          <div className="lg:h-[calc(100vh-330px)] lg:min-h-[460px] h-auto flex flex-col">
            <AnimatePresence mode="wait">
              {selectedEvent ? (
                // Selected Event Live Details Panel
                <EventDetailsPanel 
                  selectedEvent={selectedEvent}
                  setSelectedEvent={setSelectedEvent}
                  setPrefilledDate={setPrefilledDate}
                  setIsCreateModalOpen={setIsCreateModalOpen}
                  navigate={navigate}
                />
              ) : (
                // Upcoming Agenda List (Idle Panel)
                <UpcomingAgenda 
                  upcomingEvents={upcomingEvents}
                  setSelectedEvent={setSelectedEvent}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Global View Events Modal */}
      <AnimatePresence>
        {popoverDate && (
          <DateEventsModal
            date={popoverDate}
            events={popoverEvents}
            onEventClick={setSelectedEvent}
            onClose={() => setPopoverDate(null)}
          />
        )}
      </AnimatePresence>

      {/* Premium Event Scheduler Modal */}
      <PremiumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Catering Event"
        description="Plan meals, locations, and attendance for upcoming bookings."
      >
        <CreateEventForm 
          onSubmit={handleCreateEvent}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
          initialData={prefilledDate ? { date: prefilledDate } : null}
        />
      </PremiumModal>
      
    </div>
  );
};

export default CalendarPage;
