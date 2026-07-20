import React from "react";
import { useEvents } from "./hooks/useEvents";
import EventToolbar from "./components/EventToolbar";
import EventList from "./components/EventList";
import PremiumModal from "../../components/ui/PremiumModal";
import CreateEventForm from "../../components/calendar/CreateEventForm";
import CustomEventPopup from "./components/CustomEventPopup";
import { useTranslation } from "react-i18next";

const EventsView = () => {
  const { t } = useTranslation();
  const {
    events,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    params,
    viewMode,
    isModalOpen,
    isCreating,
    setViewMode,
    setFilter,
    handleSearch,
    handleNextPage,
    handlePreviousPage,
    clearFilters,
    openModal,
    closeModal,
    handleViewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleStatusUpdateEvent,
    handleCreateEvent,
    eventToDelete,
    statusUpdateEvent,
    cancelDelete,
    cancelStatusUpdate,
    confirmDelete,
    confirmUpdateStatus,
    isDeleting,
    isUpdatingStatus
  } = useEvents();

  return (
    <div className="space-y-8 pb-10">
      <EventToolbar 
        params={params}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setFilter={setFilter}
        handleSearch={handleSearch}
        openModal={openModal}
      />

      <EventList 
        events={events}
        isLoading={isLoading}
        viewMode={viewMode}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
        clearFilters={clearFilters}
        handleViewEvent={handleViewEvent}
        handleEditEvent={handleEditEvent}
        handleDeleteEvent={handleDeleteEvent}
        handleStatusUpdateEvent={handleStatusUpdateEvent}
      />

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => closeModal('events')}
        title={t("events.create_new_event", "Create New Event")}
        description={t("events.create_new_event_desc", "Fill in the details to schedule a new catering event.")}
        compactHeader={true}
      >
        <CreateEventForm 
          onSubmit={handleCreateEvent}
          onCancel={() => closeModal('events')}
          isLoading={isCreating}
        />
      </PremiumModal>

      <CustomEventPopup
        isOpen={!!eventToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        type="delete"
        event={eventToDelete}
        isLoading={isDeleting}
      />

      <CustomEventPopup
        isOpen={!!statusUpdateEvent}
        onClose={cancelStatusUpdate}
        onConfirm={confirmUpdateStatus}
        type="status"
        event={statusUpdateEvent}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
};

export default EventsView;
